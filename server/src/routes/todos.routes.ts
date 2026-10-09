import { Router } from 'express';
import {
  createTodo,
  deleteTodo,
  listTodos,
  toggleTodo,
  updateTodo,
} from '../controllers/todos.controller.js';
import { validateId } from '../validators/validate-id.js';

export const todosRouter = Router();

todosRouter.param('id', validateId);

todosRouter.get('/', listTodos);
todosRouter.post('/', createTodo);
todosRouter.put('/:id', updateTodo);
todosRouter.patch('/:id/done', toggleTodo);
todosRouter.delete('/:id', deleteTodo);
