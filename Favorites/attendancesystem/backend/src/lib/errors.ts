import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export class AppError extends Error {
  readonly httpStatus: number;
  readonly code?: string;

  constructor(message: string, httpStatus: number = 400, code?: string) {
    super(message);
    this.name       = 'AppError';
    this.httpStatus = httpStatus;
    this.code       = code;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

// Maps PostgreSQL/Supabase error codes to plain-language messages.
// Returns the original raw error alongside so callers can log it.
export function mapDbError(
  error: { code?: string; message?: string },
): AppError {
  switch (error.code) {
    case '23505':
      return new AppError('This item already exists.', 409, 'DUPLICATE');
    case '23503':
      return new AppError('A linked record was not found.', 400, 'FK_VIOLATION');
    case '23514':
      return new AppError('The data you entered is not allowed.', 400, 'CHECK_VIOLATION');
    case 'PGRST116':
      return new AppError('We could not find what you were looking for.', 404, 'NOT_FOUND');
    case 'PGRST204':
      return new AppError('Something went wrong. Please try again.', 500, 'SCHEMA_ERROR');
    default: {
      // Attach the raw DB info so the route's catch / error handler can log it
      const appErr = new AppError('Something went wrong. Please try again.', 500, 'DB_ERROR');
      (appErr as AppError & { _rawDbError: unknown })._rawDbError =
        { code: error.code, message: error.message };
      return appErr;
    }
  }
}

// Friendly labels for common HTTP status codes (used as fallback for Fastify built-ins).
const HTTP_MESSAGES: Record<number, string> = {
  400: 'The request could not be understood. Please check your input.',
  401: 'Please log in to continue.',
  403: 'You do not have permission to do that.',
  404: 'We could not find what you were looking for.',
  405: 'This action is not allowed here.',
  408: 'The request took too long. Please try again.',
  409: 'This item already exists.',
  410: 'This link is no longer available.',
  413: 'The file or data you sent is too large.',
  422: 'The data you sent could not be processed.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
};

// Global Fastify error handler — formats all errors consistently.
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  // Zod validation errors
  if (error instanceof ZodError) {
    reply.status(400).send({
      error:   'Please check the highlighted fields and try again.',
      details: error.flatten().fieldErrors,
    });
    return;
  }

  // Our own AppError — use the symbol tag check so instanceof never misfires
  if (isAppError(error)) {
    if (error.httpStatus >= 500) {
      // Log the real cause server-side so you can diagnose it
      const raw = (error as AppError & { _rawDbError?: unknown })._rawDbError;
      request.log.error(
        { err: raw ?? error.message, path: request.url, method: request.method },
        '[DB_ERROR] database operation failed',
      );
    }
    reply.status(error.httpStatus).send({
      error: error.message,
      code:  error.code,
    });
    return;
  }

  // Fastify built-in errors (route not found, method not allowed, etc.)
  if (error.statusCode) {
    const friendly = HTTP_MESSAGES[error.statusCode] ?? error.message;
    reply.status(error.statusCode).send({ error: friendly });
    return;
  }

  // Unexpected crash — log it so it shows in the server terminal
  request.log.error(
    { err: error, path: request.url, method: request.method },
    '[UNHANDLED] unexpected error',
  );
  reply.status(500).send({ error: 'Something went wrong on our end. Please try again.' });
}
