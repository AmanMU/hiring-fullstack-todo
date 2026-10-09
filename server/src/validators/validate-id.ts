import type { RequestParamHandler } from 'express';
import { isObjectIdOrHexString } from 'mongoose';
import { HttpError } from '../middleware/errors.js';

// A malformed id is a client error (400), not a missing todo (404) or a cast failure (500).
export const validateId: RequestParamHandler = (_req, _res, next, id: string) => {
  if (!isObjectIdOrHexString(id)) return next(new HttpError(400, 'Invalid todo id'));
  next();
};
