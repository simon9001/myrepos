import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { appConfig } from './config';
import { errorHandler } from './lib/errors';
import { authPlugin } from './plugins/auth';
import { registerRoutes } from './routes';

export async function buildServer() {
  const app = Fastify({
    logger:
      appConfig.NODE_ENV === 'production'
        ? { level: 'warn' }
        : { level: 'info', transport: { target: 'pino-pretty' } },
    trustProxy: true,          // read real IP from X-Forwarded-For (behind nginx/load balancer)
    bodyLimit: 10 * 1024 * 1024, // 10 MB body limit (for base64 signature + photo)
  });

  // ─── Security headers ──────────────────────────────────────────────────────
  await app.register(helmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  // ─── CORS ─────────────────────────────────────────────────────────────────
  // CORS_ORIGINS overrides if set; otherwise fall back to APP_URL alone.
  const corsOrigins = (appConfig.CORS_ORIGINS ?? appConfig.APP_URL)
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  await app.register(cors, {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ─── Multipart (file uploads for templates) ───────────────────────────────
  await app.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20 MB for Word templates
      files: 1,
    },
  });

  // ─── Rate limiting ────────────────────────────────────────────────────────
  // Global limit: 500 req / 15 min per IP
  await app.register(rateLimit, {
    max: 500,
    timeWindow: '15 minutes',
    errorResponseBuilder: (_req, context) => ({
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)}s.`,
    }),
  });

  // ─── Sensible defaults (httpErrors helpers) ────────────────────────────────
  await app.register(sensible);

  // ─── JWT auth plugin ───────────────────────────────────────────────────────
  await app.register(authPlugin);

  // ─── Global error handler — MUST be before routes ─────────────────────────
  // Fastify captures the error handler per-scope at plugin load time.
  // Setting it after routes would leave those routes using the default 500 handler.
  app.setErrorHandler(errorHandler);

  // ─── Health check ──────────────────────────────────────────────────────────
  app.get('/health', { config: { rateLimit: { max: 1000 } } }, async () => ({
    status: 'ok',
    pid: process.pid,
    uptime: process.uptime(),
  }));

  // ─── Routes ───────────────────────────────────────────────────────────────
  await app.register(registerRoutes, { prefix: '/api/v1' });

  return app;
}
