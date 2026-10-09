import type { RequestParamHandler } from 'express';
import { isObjectIdOrHexString } from 'mongoose';
import { z } from 'zod';
import { HttpError } from '../middleware/errors.js';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from '../models/todo.model.js';

export const validateTodoId: RequestParamHandler = (_req, _res, next, id: string) => {
  if (!isObjectIdOrHexString(id)) throw new HttpError(400, 'Invalid todo id');
  next();
};

const title = z
  .string({
    error: (issue) => (issue.input === undefined ? 'Title is required' : 'Title must be text'),
  })
  .trim()
  .min(1, 'Title is required')
  .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`);

const description = z
  .string('Description must be text')
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`);

// express.json() leaves the body undefined when the request isn't JSON
const notJsonObject: z.core.$ZodErrorMap = (issue) =>
  issue.code === 'invalid_type' ? 'Request body must be a JSON object' : undefined;

export const createTodoSchema = z.strictObject(
  { title, description: description.optional() },
  { error: notJsonObject },
);

export const updateTodoSchema = z
  .strictObject(
    { title: title.optional(), description: description.optional() },
    { error: notJsonObject },
  )
  .refine(
    (body) => body.title !== undefined || body.description !== undefined,
    'Provide a title or a description to update',
  );
