import { Router } from 'express';
import {
  createTodo,
  deleteTodo,
  listTodos,
  toggleTodo,
  updateTodo,
} from '../controllers/todos.controller.js';
import { validateTodoId } from '../validators/todo.validator.js';

export const todosRouter = Router();

todosRouter.param('id', validateTodoId);

todosRouter.get('/', listTodos);
todosRouter.post('/', createTodo);
todosRouter.put('/:id', updateTodo);
todosRouter.patch('/:id/done', toggleTodo);
todosRouter.delete('/:id', deleteTodo);
