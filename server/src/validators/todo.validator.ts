import { z } from 'zod';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from '../models/todo.model.js';

const title = z
  .string({
    error: (issue) => (issue.input === undefined ? 'Title is required' : 'Title must be text'),
  })
  .trim()
  .min(1, 'Title is required')
  .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`);

const description = z
  .string({ error: 'Description must be text' })
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`);

// strictObject rejects unknown keys, so a client can't sneak in fields like `done` or `_id`.
export const createTodoSchema = z.strictObject({
  title,
  description: description.optional(),
});

export const updateTodoSchema = z
  .strictObject({
    title: title.optional(),
    description: description.optional(),
  })
  .refine((body) => body.title !== undefined || body.description !== undefined, {
    error: 'Provide a title or a description to update',
  });
