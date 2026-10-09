import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFound } from './middleware/errors.js';
import { todosRouter } from './routes/todos.routes.js';

const JSON_BODY_LIMIT = '10kb';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use('/api/todos', todosRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
