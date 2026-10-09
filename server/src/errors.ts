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

// Every error response has the same shape: { error: { message, details? } }.
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
    return { status: 400, message: err.issues[0].message, details: fieldErrors };
  }
  // express.json() tags its errors with a `type`.
  if (hasType(err, 'entity.parse.failed')) {
    return { status: 400, message: 'Request body must be valid JSON' };
  }
  if (hasType(err, 'entity.too.large')) {
    return { status: 413, message: 'Request body is too large' };
  }
  // Express and body-parser mark other client mistakes (bad URL encoding, unsupported charset) with a 4xx status.
  const status = clientErrorStatus(err);
  if (status !== undefined && err instanceof Error) {
    return { status, message: err.message };
  }
  return { status: 500, message: 'Something went wrong. Please try again.' };
}

function hasType(err: unknown, type: string): boolean {
  return typeof err === 'object' && err !== null && 'type' in err && err.type === type;
}

function clientErrorStatus(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null || !('status' in err)) return undefined;
  const { status } = err;
  return typeof status === 'number' && status >= 400 && status < 500 ? status : undefined;
}
