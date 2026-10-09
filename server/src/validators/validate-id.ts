import type { RequestParamHandler } from 'express';
import { isObjectIdOrHexString } from 'mongoose';
import { HttpError } from '../middleware/errors.js';

export const validateId: RequestParamHandler = (_req, _res, next, id: string) => {
  if (!isObjectIdOrHexString(id)) return next(new HttpError(400, 'Invalid todo id'));
  next();
};
