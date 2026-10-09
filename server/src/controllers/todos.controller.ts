import type { Request, Response } from 'express';
import { HttpError } from '../middleware/errors.js';
import { NEWEST_FIRST, TodoModel } from '../models/todo.model.js';
import { createTodoSchema, updateTodoSchema } from '../validators/todo.validator.js';

export async function listTodos(_req: Request, res: Response) {
  const todos = await TodoModel.find().sort(NEWEST_FIRST).lean();
  res.json(todos);
}

export async function createTodo(req: Request, res: Response) {
  const { title, description } = createTodoSchema.parse(req.body);
  const todo = await TodoModel.create({ title, description: description || undefined });
  res.status(201).json(todo);
}

export async function updateTodo(req: Request, res: Response) {
  const { title, description } = updateTodoSchema.parse(req.body);
  // Mongoose drops undefined keys, so a field the client didn't send stays as it is
  const update =
    description === ''
      ? { $set: { title }, $unset: { description: 1 } }
      : { $set: { title, description } };
  const todo = await TodoModel.findByIdAndUpdate(req.params.id, update, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  res.json(ensureFound(todo));
}

export async function toggleTodo(req: Request, res: Response) {
  // flipped inside MongoDB so two quick toggles can't race
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
