import type { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type ErrorDescription = {
  status: number;
  message: string;
  details?: Record<string, string[] | undefined>;
};

export const notFound: RequestHandler = () => {
  throw new HttpError(404, 'Route not found');
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const { status, message, details } = describeError(err);
  if (status === 500) console.error(err);
  res.status(status).json({ error: { message, details } });
};

function describeError(err: unknown): ErrorDescription {
  if (err instanceof HttpError) {
    return { status: err.status, message: err.message };
  }
  if (err instanceof z.ZodError) {
    const { fieldErrors } = z.flattenError(err);
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;
    return {
      status: 400,
      message: err.issues[0].message,
      details: hasFieldErrors ? fieldErrors : undefined,
    };
  }
  if (hasType(err, 'entity.parse.failed')) {
    return { status: 400, message: 'Request body must be valid JSON' };
  }
  if (hasType(err, 'entity.too.large')) {
    return { status: 413, message: 'Request body is too large' };
  }
  // Express tags other client mistakes, like a malformed URL encoding, with a 4xx status
  if (isClientError(err)) {
    return { status: err.status, message: err.message };
  }
  return { status: 500, message: 'Something went wrong. Please try again.' };
}

function hasType(err: unknown, type: string): boolean {
  return typeof err === 'object' && err !== null && 'type' in err && err.type === type;
}

function isClientError(err: unknown): err is Error & { status: number } {
  return (
    err instanceof Error &&
    'status' in err &&
    typeof err.status === 'number' &&
    err.status >= 400 &&
    err.status < 500
  );
}
