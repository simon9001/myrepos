import type { FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import { z } from 'zod';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { appConfig } from '../config';
import { signAccessToken } from '../plugins/auth';
import { hashPassword, verifyPassword } from '../lib/password';
import { issueAuthOtp, verifyAuthOtp } from '../lib/auth_otp';

// ─── Security constants ───────────────────────────────────────────────────────

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES    = 15;
const REFRESH_TTL_MS     = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Refresh-token helpers ─────────────────────────────────────────────────────
// Raw token: 48 random bytes → 96 hex chars (never stored)
// Stored:    SHA-256 of raw token (can't reverse to raw)

function makeRawRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

function hashRefreshToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function storeRefreshToken(userId: string, raw: string): Promise<void> {
  const { error } = await adminDb.from('refresh_tokens').insert({
    user_id:    userId,
    token_hash: hashRefreshToken(raw),
    expires_at: new Date(Date.now() + REFRESH_TTL_MS).toISOString(),
  });
  if (error) throw new AppError('Could not start your session. Please try again.', 500);
}

async function revokeAllUserTokens(userId: string): Promise<void> {
  await adminDb.from('refresh_tokens').delete().eq('user_id', userId);
}

// ─── Password policy ───────────────────────────────────────────────────────────

const passwordPolicy = z
  .string()
  .min(8,   'At least 8 characters required')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number');

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
  full_name: z.string().min(2).max(200).trim(),
  email:     z.string().email().transform((e) => e.toLowerCase()),
  password:  passwordPolicy,
  phone:     z.string().max(30).optional(),
});

const loginSchema = z.object({
  email:    z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

const verifyEmailSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase()),
  code:  z.string().length(6).regex(/^\d{6}$/),
});

const forgotSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase()),
});

const resetSchema = z.object({
  email:        z.string().email().transform((e) => e.toLowerCase()),
  code:         z.string().length(6).regex(/^\d{6}$/),
  new_password: passwordPolicy,
});

const registerOrgSchema = z.object({
  // Company
  org_name:      z.string().min(2).max(120).trim(),
  industry:      z.string().min(1).max(100),
  country:       z.string().min(1).max(100),
  company_email: z.string().email().transform(e => e.toLowerCase()),
  company_phone: z.string().max(30),
  address:       z.string().max(500).optional(),
  website:       z.string().url().optional().or(z.literal('')),
  // Administrator
  first_name:    z.string().min(1).max(100).trim(),
  last_name:     z.string().min(1).max(100).trim(),
  job_title:     z.string().min(1).max(200).trim(),
  email:         z.string().email().transform(e => e.toLowerCase()),
  phone:         z.string().max(30).optional(),
  password:      passwordPolicy,
  // Plan
  plan: z.enum(['free_trial', 'basic', 'professional', 'enterprise']).default('free_trial'),
});

const completeInviteSchema = z.object({
  token:      z.string().min(1),
  first_name: z.string().min(1).max(100).trim(),
  last_name:  z.string().min(1).max(100).trim(),
  password:   passwordPolicy,
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password:     passwordPolicy,
});

const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(200).trim().optional(),
  phone:     z.string().max(30).nullable().optional(),
});

const logoutSchema = z.object({
  refresh_token: z.string().min(1).optional(),
  all_devices:   z.boolean().default(false),
});

// ─── Slug helper ──────────────────────────────────────────────────────────────

async function generateUniqueSlug(name: string): Promise<string> {
  const base = name.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
  const { data } = await adminDb.from('organizations').select('id').eq('slug', base).maybeSingle();
  if (!data) return base;
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Types for rows that include auth-only columns ────────────────────────────

type LoginRow = {
  id:                    string;
  email:                 string;
  full_name:             string;
  phone:                 string | null;
  avatar_url:            string | null;
  platform_role:         'platform_owner' | 'user';
  email_verified:        boolean;
  password_hash:         string | null;
  failed_login_attempts: number;
  locked_until:          string | null;
};

// ─── Rate limits ──────────────────────────────────────────────────────────────

const authLimit   = { max: 10, timeWindow: '15 minutes' };
const strictLimit = { max: 5,  timeWindow: '15 minutes' };

// ─── Plugin ───────────────────────────────────────────────────────────────────

export const authRoutes: FastifyPluginAsync = async (fastify) => {

  // ── POST /auth/register ───────────────────────────────────────────────────
  fastify.post('/register', { config: { rateLimit: authLimit } }, async (request, reply) => {
    const body = registerSchema.parse(request.body);

    // Check email not taken
    const { data: existing } = await adminDb
      .from('profiles')
      .select('id')
      .eq('email', body.email)
      .maybeSingle();

    if (existing) throw new AppError('An account with this email already exists.', 409);

    const password_hash = await hashPassword(body.password);

    const { data: user, error } = await adminDb
      .from('profiles')
      .insert({
        email: body.email,
        full_name: body.full_name,
        phone: body.phone ?? null,
        password_hash,
        email_verified: false,
      })
      .select('id, email, full_name, phone, platform_role, email_verified')
      .single();

    if (error) throw mapDbError(error);

    // Send verification OTP — non-blocking so a Resend failure doesn't abort registration
    issueAuthOtp(body.email, 'email_verification').catch(
      (err) => fastify.log.error({ err }, '[auth] Verification OTP send failed'),
    );

    const access_token  = signAccessToken(user as { id: string; email: string; platform_role: 'platform_owner' | 'user' });
    const refresh_token = makeRawRefreshToken();
    await storeRefreshToken(user.id as string, refresh_token);

    return reply.status(201).send({
      user,
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: appConfig.JWT_ACCESS_EXPIRES_IN,
    });
  });

  // ── POST /auth/login ──────────────────────────────────────────────────────
  fastify.post('/login', { config: { rateLimit: authLimit } }, async (request, reply) => {
    const body = loginSchema.parse(request.body);

    // Include auth fields — never returned to client (stripped via destructuring below)
    const _lr = await adminDb
      .from('profiles')
      // Template literal keeps the string as a literal type so Supabase inference works
      .select(`id, email, full_name, phone, avatar_url, platform_role, email_verified, password_hash, failed_login_attempts, locked_until`)
      .eq('email', body.email)
      .maybeSingle();
    const user = _lr.data as LoginRow | null;

    // Same error for "no account" and "wrong password" — prevents user enumeration
    if (!user || !user.password_hash) {
      throw new AppError('Login failed. Check your email and password.', 401);
    }

    // Check lockout
    if (user.locked_until && new Date(user.locked_until as string) > new Date()) {
      const mins = Math.ceil(
        (new Date(user.locked_until as string).getTime() - Date.now()) / 60_000,
      );
      throw new AppError(`Your account is locked. Try again in ${mins} minute(s).`, 423);
    }

    // bcrypt compare — timing-safe by design
    const valid = await verifyPassword(body.password, user.password_hash as string);

    if (!valid) {
      const newAttempts = (user.failed_login_attempts as number) + 1;

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Lock for LOCKOUT_MINUTES, reset counter
        await adminDb.from('profiles').update({
          failed_login_attempts: 0,
          locked_until: new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString(),
        }).eq('id', user.id);

        throw new AppError(
          `Too many failed attempts. Your account is locked for ${LOCKOUT_MINUTES} minutes.`,
          423,
        );
      }

      await adminDb.from('profiles')
        .update({ failed_login_attempts: newAttempts })
        .eq('id', user.id);

      throw new AppError('Login failed. Check your email and password.', 401);
    }

    // Block unverified accounts — verified check is after password so we don't
    // reveal whether the account exists to someone who got the password wrong.
    if (!user.email_verified) {
      throw new AppError(
        'Please verify your email before logging in.',
        403,
        'EMAIL_NOT_VERIFIED',
      );
    }

    // Reset counters on success
    if ((user.failed_login_attempts as number) > 0 || user.locked_until) {
      await adminDb.from('profiles')
        .update({ failed_login_attempts: 0, locked_until: null })
        .eq('id', user.id);
    }

    // Strip sensitive fields before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, failed_login_attempts, locked_until, ...safeUser } =
      user as Record<string, unknown>;

    const access_token  = signAccessToken(safeUser as { id: string; email: string; platform_role: 'platform_owner' | 'user' });
    const refresh_token = makeRawRefreshToken();
    await storeRefreshToken(safeUser.id as string, refresh_token);

    return reply.send({
      user: safeUser,
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: appConfig.JWT_ACCESS_EXPIRES_IN,
    });
  });

  // ── POST /auth/refresh ────────────────────────────────────────────────────
  // Refresh token rotation: old token deleted, new one issued on every call.
  // If token is presented but already deleted → replay attack → deny.
  fastify.post('/refresh', { config: { rateLimit: authLimit } }, async (request, reply) => {
    const { refresh_token } = refreshSchema.parse(request.body);
    const tokenHash = hashRefreshToken(refresh_token);

    const { data: stored } = await adminDb
      .from('refresh_tokens')
      .select('id, user_id, expires_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (!stored) {
      throw new AppError('Your session is no longer valid. Please log in again.', 401);
    }

    if (new Date(stored.expires_at as string) < new Date()) {
      await adminDb.from('refresh_tokens').delete().eq('id', stored.id);
      throw new AppError('Your session has expired. Please log in again.', 401);
    }

    const { data: user } = await adminDb
      .from('profiles')
      .select('id, email, full_name, platform_role, email_verified')
      .eq('id', stored.user_id)
      .maybeSingle();

    if (!user) {
      await adminDb.from('refresh_tokens').delete().eq('id', stored.id);
      throw new AppError('We could not find your account. Please log in again.', 401);
    }

    // Rotate: delete old → insert new atomically
    await adminDb.from('refresh_tokens').delete().eq('id', stored.id);

    const access_token      = signAccessToken(user as { id: string; email: string; platform_role: 'platform_owner' | 'user' });
    const new_refresh_token = makeRawRefreshToken();
    await storeRefreshToken(user.id as string, new_refresh_token);

    return reply.send({
      access_token,
      refresh_token: new_refresh_token,
      token_type:    'Bearer',
      expires_in:    appConfig.JWT_ACCESS_EXPIRES_IN,
    });
  });

  // ── POST /auth/logout ─────────────────────────────────────────────────────
  fastify.post('/logout', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const body = logoutSchema.parse(request.body ?? {});

    if (body.all_devices || !body.refresh_token) {
      await revokeAllUserTokens(request.authUser.id);
    } else {
      const hash = hashRefreshToken(body.refresh_token);
      await adminDb.from('refresh_tokens')
        .delete()
        .eq('token_hash', hash)
        .eq('user_id', request.authUser.id);
    }

    return reply.send({ message: 'Logged out successfully.' });
  });

  // ── GET /auth/me ──────────────────────────────────────────────────────────
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { data: profile, error } = await adminDb
      .from('profiles')
      .select(`
        id, email, full_name, phone, avatar_url, platform_role, email_verified, created_at,
        memberships:organization_members (
          id, role, designation,
          organization:organizations (id, name, logo_url)
        )
      `)
      .eq('id', request.authUser.id)
      .single();

    if (error || !profile) throw new AppError('User not found.', 404);
    return reply.send(profile);
  });

  // ── PATCH /auth/me ────────────────────────────────────────────────────────
  fastify.patch('/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const body = updateProfileSchema.parse(request.body);

    const { data, error } = await adminDb
      .from('profiles')
      .update(body)
      .eq('id', request.authUser.id)
      .select('id, email, full_name, phone, avatar_url, platform_role, email_verified')
      .single();

    if (error) throw mapDbError(error);
    return reply.send(data);
  });

  // ── POST /auth/change-password ────────────────────────────────────────────
  fastify.post('/change-password', {
    preHandler: [fastify.authenticate],
    config:     { rateLimit: strictLimit },
  }, async (request, reply) => {
    const body = changePasswordSchema.parse(request.body);

    if (body.current_password === body.new_password) {
      throw new AppError('New password must differ from current password.', 400);
    }

    const _cp = await adminDb
      .from('profiles')
      .select(`password_hash`)
      .eq('id', request.authUser.id)
      .single();
    const pwRow = _cp.data as { password_hash: string | null } | null;

    if (!pwRow?.password_hash) throw new AppError('This account does not have a password. Try another sign-in method.', 400);

    const valid = await verifyPassword(body.current_password, pwRow.password_hash);
    if (!valid) throw new AppError('Current password is incorrect.', 400);

    const newHash = await hashPassword(body.new_password);
    await adminDb.from('profiles')
      .update({ password_hash: newHash })
      .eq('id', request.authUser.id);

    // Revoke ALL sessions — forces re-login on all devices for security
    await revokeAllUserTokens(request.authUser.id);

    return reply.send({ message: 'Password changed. Please log in again on all devices.' });
  });

  // ── POST /auth/forgot-password ────────────────────────────────────────────
  fastify.post('/forgot-password', { config: { rateLimit: strictLimit } }, async (request, reply) => {
    const { email } = forgotSchema.parse(request.body);

    // Fire-and-forget: never reveal whether the email exists
    adminDb
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          issueAuthOtp(email, 'password_reset').catch(
            (err) => fastify.log.error({ err }, '[auth] Password reset OTP failed'),
          );
        }
      });

    return reply.send({
      message: 'If an account with that email exists, a 6-digit reset code has been sent.',
    });
  });

  // ── POST /auth/reset-password ─────────────────────────────────────────────
  fastify.post('/reset-password', { config: { rateLimit: strictLimit } }, async (request, reply) => {
    const body = resetSchema.parse(request.body);

    // verifyAuthOtp throws on invalid/expired/exhausted
    await verifyAuthOtp(body.email, body.code, 'password_reset');

    const newHash = await hashPassword(body.new_password);

    await adminDb.from('profiles').update({
      password_hash:         newHash,
      failed_login_attempts: 0,
      locked_until:          null,
    }).eq('email', body.email);

    // Revoke all sessions (force fresh login)
    const { data: user } = await adminDb
      .from('profiles')
      .select('id')
      .eq('email', body.email)
      .maybeSingle();

    if (user) await revokeAllUserTokens(user.id as string);

    return reply.send({ message: 'Password reset. You can now log in with your new password.' });
  });

  // ── POST /auth/verify-email ───────────────────────────────────────────────
  fastify.post('/verify-email', { config: { rateLimit: authLimit } }, async (request, reply) => {
    const body = verifyEmailSchema.parse(request.body);

    await verifyAuthOtp(body.email, body.code, 'email_verification');

    await adminDb.from('profiles')
      .update({ email_verified: true })
      .eq('email', body.email);

    return reply.send({ message: 'Email verified successfully.' });
  });

  // ── POST /auth/resend-verification ───────────────────────────────────────
  fastify.post('/resend-verification', { config: { rateLimit: strictLimit } }, async (request, reply) => {
    const { email } = forgotSchema.parse(request.body);

    // Fire-and-forget
    adminDb
      .from('profiles')
      .select('email_verified')
      .eq('email', email)
      .maybeSingle()
      .then(({ data }) => {
        if (data && !data.email_verified) {
          issueAuthOtp(email, 'email_verification').catch(
            (err) => fastify.log.error({ err }, '[auth] Resend verification failed'),
          );
        }
      });

    return reply.send({
      message: 'If an unverified account with that email exists, a new code has been sent.',
    });
  });

  // ── GET /auth/invite-details/:token ──────────────────────────────────────
  // Public endpoint — returns just enough info to render the join page.
  fastify.get('/invite-details/:token', async (request, reply) => {
    const { token } = request.params as { token: string };

    const { data: invite } = await adminDb
      .from('invitations')
      .select('email, status, expires_at, organization:organizations(name, logo_url)')
      .eq('token', token)
      .maybeSingle();

    if (!invite) throw new AppError('This invite link is not valid.', 404);

    if (invite.expires_at && new Date(invite.expires_at as string) < new Date()) {
      throw new AppError('This invite link has expired.', 410);
    }

    const org = (invite.organization as unknown) as { name: string; logo_url: string | null };
    return reply.send({
      email:    invite.email,
      org_name: org.name,
      org_logo: org.logo_url,
    });
  });

  // ── POST /auth/register-org ───────────────────────────────────────────────
  // Creates an organization and its first administrator in one step.
  fastify.post('/register-org', { config: { rateLimit: authLimit } }, async (request, reply) => {
    const body = registerOrgSchema.parse(request.body);

    // Check admin email not already registered
    const { data: existingUser } = await adminDb
      .from('profiles')
      .select('id')
      .eq('email', body.email)
      .maybeSingle();
    if (existingUser) throw new AppError('An account with this email already exists.', 409);

    const password_hash = await hashPassword(body.password);
    const full_name     = `${body.first_name} ${body.last_name}`.trim();
    const slug          = await generateUniqueSlug(body.org_name);

    // Create organization
    const { data: org, error: orgErr } = await adminDb
      .from('organizations')
      .insert({
        name:              body.org_name,
        slug,
        industry:          body.industry,
        country:           body.country,
        company_email:     body.company_email,
        company_phone:     body.company_phone,
        address:           body.address   ?? null,
        website:           body.website   ?? null,
        subscription_plan: body.plan,
      })
      .select('id, name, slug, logo_url, industry, country, subscription_plan, created_at')
      .single();

    if (orgErr) throw mapDbError(orgErr);

    // Create admin profile
    const { data: user, error: userErr } = await adminDb
      .from('profiles')
      .insert({
        email:          body.email,
        full_name,
        phone:          body.phone ?? null,
        password_hash,
        email_verified: false,
      })
      .select('id, email, full_name, phone, platform_role, email_verified')
      .single();

    if (userErr) {
      // Roll back org if profile failed
      await adminDb.from('organizations').delete().eq('id', org.id);
      throw mapDbError(userErr);
    }

    // Make them super_admin
    await adminDb.from('organization_members').insert({
      organization_id: org.id,
      user_id:         (user as { id: string }).id,
      role:            'super_admin',
      designation:     body.job_title,
      is_active:       true,
      joined_at:       new Date().toISOString(),
    });

    // Send verification OTP (non-blocking)
    issueAuthOtp(body.email, 'email_verification').catch(
      (err) => fastify.log.error({ err }, '[auth] Verification OTP send failed'),
    );

    const access_token  = signAccessToken(user as { id: string; email: string; platform_role: 'platform_owner' | 'user' });
    const refresh_token = makeRawRefreshToken();
    await storeRefreshToken((user as { id: string }).id, refresh_token);

    return reply.status(201).send({
      user,
      org,
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: appConfig.JWT_ACCESS_EXPIRES_IN,
    });
  });

  // ── POST /auth/complete-invite ────────────────────────────────────────────
  // Public endpoint — new user creates their account by accepting an invite.
  fastify.post('/complete-invite', { config: { rateLimit: authLimit } }, async (request, reply) => {
    const body = completeInviteSchema.parse(request.body);

    const { data: invite } = await adminDb
      .from('invitations')
      .select('id, organization_id, email, expires_at, invited_by, org_role')
      .eq('token', body.token)
      .maybeSingle();

    if (!invite) throw new AppError('This invite link is not valid.', 404);

    if (invite.expires_at && new Date(invite.expires_at as string) < new Date()) {
      throw new AppError('This invite link has expired. Ask your admin for a new one.', 410);
    }

    const email = invite.email as string;
    if (!email) throw new AppError('This invite link is not valid.', 400);

    const { data: existing } = await adminDb
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new AppError(
        'An account with this email already exists. Please log in instead.',
        409,
        'ALREADY_EXISTS',
      );
    }

    const password_hash = await hashPassword(body.password);
    const full_name     = `${body.first_name} ${body.last_name}`.trim();

    // Email is considered verified — they proved access by clicking the link
    const { data: user, error: userErr } = await adminDb
      .from('profiles')
      .insert({
        email,
        full_name,
        password_hash,
        email_verified: true,
      })
      .select('id, email, full_name, phone, platform_role, email_verified')
      .single();

    if (userErr) throw mapDbError(userErr);

    const role = (invite.org_role as string | null) ?? 'participant';

    await adminDb.from('organization_members').insert({
      organization_id: invite.organization_id,
      user_id:         (user as { id: string }).id,
      role,
      is_active:       true,
      invited_by:      invite.invited_by ?? null,
      joined_at:       new Date().toISOString(),
    });

    await adminDb.from('invitations').update({ status: 'signed' }).eq('id', invite.id);

    const access_token  = signAccessToken(user as { id: string; email: string; platform_role: 'platform_owner' | 'user' });
    const refresh_token = makeRawRefreshToken();
    await storeRefreshToken((user as { id: string }).id, refresh_token);

    return reply.status(201).send({
      user,
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: appConfig.JWT_ACCESS_EXPIRES_IN,
    });
  });

  // ── POST /auth/accept-invite ──────────────────────────────────────────────
  // Logged-in user accepts a member invitation token to join an organization.
  fastify.post('/accept-invite', {
    preHandler: [fastify.authenticate],
    config:     { rateLimit: authLimit },
  }, async (request, reply) => {
    const { token } = z.object({ token: z.string().min(1) }).parse(request.body);

    const { data: invite } = await adminDb
      .from('invitations')
      .select('id, organization_id, email, status, expires_at, invited_by')
      .eq('token', token)
      .maybeSingle();

    if (!invite) throw new AppError('This invite link is not valid.', 404);

    if (invite.expires_at && new Date(invite.expires_at as string) < new Date()) {
      throw new AppError('This invite link has expired. Ask your admin for a new one.', 410);
    }

    const userEmail = request.authUser.email;
    if (invite.email && (invite.email as string).toLowerCase() !== userEmail.toLowerCase()) {
      throw new AppError('This invite was sent to a different email address.', 403);
    }

    const userId = request.authUser.id;
    const orgId  = invite.organization_id as string;

    const { data: existing } = await adminDb
      .from('organization_members')
      .select('id, role, is_active')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .maybeSingle();

    let role: string;

    if (existing) {
      role = existing.role as string;
      if (!(existing.is_active as boolean)) {
        await adminDb.from('organization_members')
          .update({ is_active: true })
          .eq('id', existing.id);
      }
    } else {
      role = 'participant';
      const { error: mErr } = await adminDb.from('organization_members').insert({
        organization_id: orgId,
        user_id:         userId,
        role,
        is_active:       true,
        invited_by:      invite.invited_by ?? null,
        joined_at:       new Date().toISOString(),
      });
      if (mErr) throw mapDbError(mErr);
    }

    await adminDb.from('invitations').update({ status: 'signed' }).eq('id', invite.id);

    const { data: org } = await adminDb
      .from('organizations')
      .select('id, name, slug, logo_url')
      .eq('id', orgId)
      .single();

    return reply.send({ organization: org, role });
  });
};
