import type { Context, Next } from 'hono';
import { jwt } from 'hono/jwt';
import jwtModule from 'jsonwebtoken'; // Fix for ESM import
const { verify } = jwtModule;
import type { AuthTokenPayload } from '../types/index.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthTokenPayload;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// JWT middleware for protected routes
export const authMiddleware = jwt({
  secret: JWT_SECRET,
  alg: 'HS256', // Specify the algorithm
});

// Middleware to require admin role
export const adminOnly = async (c: Context, next: Next) => {
  const user = c.get('user') as AuthTokenPayload;
  if (user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  return await next();
};

// Optional middleware to extract user from token for public routes
export const extractUser = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    await next();
    return;
  }

  const token = authHeader.split(' ')[1];

  // Check if token exists
  if (!token) {
    await next();
    return;
  }

  try {
    const payload = verify(token, JWT_SECRET);
    // Type assertion with proper type checking
    if (typeof payload === 'object' && payload !== null && 'userId' in payload && 'role' in payload) {
      c.set('user', payload as AuthTokenPayload);
    }
  } catch (error) {
    // Invalid token, proceed without user
    console.debug('Invalid token or no user:', (error as Error).message);
  }
  await next();
};

// Middleware to require authentication (stricter version)
export const requireAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const token = authHeader.split(' ')[1];

  // Check if token exists
  if (!token) {
    return c.json({ error: 'Token missing from authorization header' }, 401);
  }

  try {
    const payload = verify(token, JWT_SECRET);
    // Type assertion with proper type checking
    if (typeof payload === 'object' && payload !== null && 'userId' in payload && 'role' in payload) {
      c.set('user', payload as AuthTokenPayload);
      await next();
      return; // Explicit return to satisfy TypeScript
    } else {
      return c.json({ error: 'Invalid token payload' }, 401);
    }
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};

// Middleware to require sponsor role
export const sponsorOnly = async (c: Context, next: Next) => {
  const user = c.get('user') as AuthTokenPayload;
  if (user.role !== 'sponsor' && user.role !== 'admin') {
    return c.json({ error: 'Sponsor access required' }, 403);
  }
  return await next();
};

// Middleware to require buyer role
export const buyerOnly = async (c: Context, next: Next) => {
  const user = c.get('user') as AuthTokenPayload;
  if (user.role !== 'buyer' && user.role !== 'admin') {
    return c.json({ error: 'Buyer access required' }, 403);
  }
  return await next();
};

// Middleware to require farmer role
export const farmerOnly = async (c: Context, next: Next) => {
  const user = c.get('user') as AuthTokenPayload;
  if (user.role !== 'farmer' && user.role !== 'admin') {
    return c.json({ error: 'Farmer access required' }, 403);
  }
  return await next();
};

// Middleware to require premium membership (for farmers)
import { supabase } from '../db/supabaseClient.js';

export const premiumOnly = async (c: Context, next: Next) => {
  const user = c.get('user') as AuthTokenPayload;

  // Admins bypass
  if (user.role === 'admin') return await next();

  // Check membership status in DB
  const { data: membership, error } = await supabase
    .from('memberships')
    .select('tier, expiry_date, payment_status')
    .eq('user_id', user.userId)
    .eq('tier', 'premium')
    .eq('payment_status', 'paid')
    .single();

  if (error || !membership) {
    return c.json({ error: 'Premium membership required' }, 403);
  }

  // Check expiry
  if (membership.expiry_date && new Date(membership.expiry_date) < new Date()) {
    return c.json({ error: 'Premium membership has expired' }, 403);
  }

  return await next();
};