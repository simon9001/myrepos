import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/errors';
import { appConfig } from '../config';
import type { AuthUser } from '../types';

// ─── Access token payload ─────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub:           string;
  email:         string;
  platform_role: 'platform_owner' | 'user';
  type:          'access';
}

// ─── Token helpers ─────────────────────────────────────────────────────────────
// Only access tokens are JWTs (short-lived, stateless).
// Refresh tokens are opaque random values stored in the DB — see routes/auth.ts.

export function signAccessToken(user: {
  id:            string;
  email:         string;
  platform_role: 'platform_owner' | 'user';
}): string {
  return jwt.sign(
    { sub: user.id, email: user.email, platform_role: user.platform_role, type: 'access' },
    appConfig.JWT_SECRET,
    { expiresIn: appConfig.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions,
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, appConfig.JWT_SECRET) as AccessTokenPayload;
    if (payload.type !== 'access') throw new AppError('Your session is invalid. Please log in again.', 401);
    return payload;
  } catch (err) {
    if (err instanceof AppError)              throw err;
    if (err instanceof jwt.TokenExpiredError) throw new AppError('Your session has expired. Please log in again.', 401);
    throw new AppError('Your session is invalid. Please log in again.', 401);
  }
}

// ─── Fastify plugin — decorates fastify.authenticate ─────────────────────────

const plugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
      const auth = request.headers.authorization;
      if (!auth?.startsWith('Bearer ')) {
        throw new AppError('Please log in to continue.', 401);
      }

      // O(1) cryptographic verification — no DB call, no network round-trip
      const payload = verifyAccessToken(auth.slice(7));

      request.authUser = {
        id:            payload.sub,
        email:         payload.email,
        platform_role: payload.platform_role,
      } as AuthUser;
    },
  );
};

export const authPlugin = fp(plugin, { name: 'auth' });

// ─── Type augmentation ────────────────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
