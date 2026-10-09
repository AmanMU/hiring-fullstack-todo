import type { Request, Response } from 'express';
import { HttpError } from '../middleware/errors.js';
import { TodoModel } from '../models/todo.model.js';
import { createTodoSchema, updateTodoSchema } from '../validators/todo.validator.js';

export async function listTodos(_req: Request, res: Response) {
  const todos = await TodoModel.find().sort({ createdAt: -1, _id: -1 }).lean();
  res.json(todos);
}

export async function createTodo(req: Request, res: Response) {
  const { title, description } = createTodoSchema.parse(req.body);
  // An empty description is stored as absent rather than as ''.
  const todo = await TodoModel.create({ title, description: description || undefined });
  res.status(201).json(todo);
}

export async function updateTodo(req: Request, res: Response) {
  const { title, description } = updateTodoSchema.parse(req.body);
  // Sending description: '' clears it.
  const update =
    description === '' ? { title, $unset: { description: 1 } } : { title, description };
  const todo = await TodoModel.findByIdAndUpdate(req.params.id, update, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  res.json(ensureFound(todo));
}

export async function toggleTodo(req: Request, res: Response) {
  // The pipeline flips `done` inside MongoDB in one atomic step, so two quick toggles can't race.
  const todo = await TodoModel.findByIdAndUpdate(
    req.params.id,
    [{ $set: { done: { $not: ['$done'] } } }],
    { returnDocument: 'after', updatePipeline: true },
  ).lean();
  res.json(ensureFound(todo));
}

export async function deleteTodo(req: Request, res: Response) {
  const todo = await TodoModel.findByIdAndDelete(req.params.id).lean();
  ensureFound(todo);
  res.sendStatus(204);
}

function ensureFound<T>(todo: T | null): T {
  if (todo === null) throw new HttpError(404, 'Todo not found');
  return todo;
}
