import { Router } from 'express';
import { isObjectIdOrHexString } from 'mongoose';
import { HttpError } from './errors.js';
import { TodoModel } from './todo.model.js';
import { createTodoSchema, updateTodoSchema } from './todo.schemas.js';

export const todosRouter = Router();

// A malformed id is a client error (400), not a missing todo (404) or a cast failure (500).
todosRouter.param('id', (_req, _res, next, id: string) => {
  if (!isObjectIdOrHexString(id)) return next(new HttpError(400, 'Invalid todo id'));
  next();
});

todosRouter.get('/', async (_req, res) => {
  const todos = await TodoModel.find().sort({ createdAt: -1, _id: -1 }).lean();
  res.json(todos);
});

todosRouter.post('/', async (req, res) => {
  const { title, description } = createTodoSchema.parse(req.body);
  // An empty description is stored as absent rather than as ''.
  const todo = await TodoModel.create({ title, description: description || undefined });
  res.status(201).json(todo);
});

todosRouter.put('/:id', async (req, res) => {
  const { title, description } = updateTodoSchema.parse(req.body);
  // Sending description: '' clears it.
  const update =
    description === '' ? { title, $unset: { description: 1 } } : { title, description };
  const todo = await TodoModel.findByIdAndUpdate(req.params.id, update, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  res.json(ensureFound(todo));
});

todosRouter.patch('/:id/done', async (req, res) => {
  // The pipeline flips `done` inside MongoDB in one atomic step, so two quick toggles can't race.
  const todo = await TodoModel.findByIdAndUpdate(
    req.params.id,
    [{ $set: { done: { $not: ['$done'] } } }],
    { returnDocument: 'after', updatePipeline: true },
  ).lean();
  res.json(ensureFound(todo));
});

todosRouter.delete('/:id', async (req, res) => {
  const todo = await TodoModel.findByIdAndDelete(req.params.id).lean();
  ensureFound(todo);
  res.sendStatus(204);
});

function ensureFound<T>(todo: T | null): T {
  if (todo === null) throw new HttpError(404, 'Todo not found');
  return todo;
}
