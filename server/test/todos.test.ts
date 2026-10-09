import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();
const MISSING_ID = '0123456789abcdef01234567';

async function createTodo(body: object = { title: 'Buy milk' }) {
  const res = await request(app).post('/api/todos').send(body).expect(201);
  return res.body;
}

describe('GET /api/todos', () => {
  it('lists todos newest first', async () => {
    await createTodo({ title: 'First' });
    await createTodo({ title: 'Second' });
    const res = await request(app).get('/api/todos').expect(200);
    expect(res.body.map((todo: { title: string }) => todo.title)).toEqual(['Second', 'First']);
  });
});

describe('POST /api/todos', () => {
  it('creates a todo with a trimmed title that is not done', async () => {
    const todo = await createTodo({ title: '  Buy milk  ', description: '2 litres' });
    expect(todo).toMatchObject({ title: 'Buy milk', description: '2 litres', done: false });
    expect(todo).toHaveProperty('_id');
    expect(todo).not.toHaveProperty('__v');
  });

  it('rejects a missing title with a field error', async () => {
    const res = await request(app).post('/api/todos').send({}).expect(400);
    expect(res.body.error.details.title).toEqual(['Title is required']);
  });

  it('rejects fields the client may not set', async () => {
    await request(app).post('/api/todos').send({ title: 'x', done: true }).expect(400);
  });

  it('rejects malformed JSON', async () => {
    await request(app)
      .post('/api/todos')
      .set('Content-Type', 'application/json')
      .send('{"title":')
      .expect(400);
  });

  it('explains a body that is not JSON', async () => {
    const res = await request(app).post('/api/todos').type('form').send('title=x').expect(400);
    expect(res.body.error).toEqual({ message: 'Request body must be a JSON object' });
  });
});

describe('PUT /api/todos/:id', () => {
  it('updates the title and keeps the description', async () => {
    const { _id } = await createTodo({ title: 'Old', description: 'Keep me' });
    const res = await request(app).put(`/api/todos/${_id}`).send({ title: 'New' }).expect(200);
    expect(res.body).toMatchObject({ title: 'New', description: 'Keep me' });
  });

  it('clears the description when sent an empty string', async () => {
    const { _id } = await createTodo({ title: 'Task', description: 'Remove me' });
    const res = await request(app).put(`/api/todos/${_id}`).send({ description: '' }).expect(200);
    expect(res.body).not.toHaveProperty('description');
  });

  it('returns 400, not 500, for an id with broken URL encoding', async () => {
    await request(app).put('/api/todos/%ZZ').send({ title: 'x' }).expect(400);
  });

  it('returns 404 for a todo that does not exist', async () => {
    await request(app).put(`/api/todos/${MISSING_ID}`).send({ title: 'x' }).expect(404);
  });
});

describe('PATCH /api/todos/:id/done', () => {
  it('flips done on each call', async () => {
    const { _id } = await createTodo();
    const first = await request(app).patch(`/api/todos/${_id}/done`).expect(200);
    const second = await request(app).patch(`/api/todos/${_id}/done`).expect(200);
    expect([first.body.done, second.body.done]).toEqual([true, false]);
  });

  it('applies two concurrent toggles atomically', async () => {
    const { _id } = await createTodo();
    await Promise.all([
      request(app).patch(`/api/todos/${_id}/done`).expect(200),
      request(app).patch(`/api/todos/${_id}/done`).expect(200),
    ]);
    const res = await request(app).get('/api/todos').expect(200);
    expect(res.body[0].done).toBe(false);
  });

  it('returns 400 for a malformed id', async () => {
    await request(app).patch('/api/todos/abc/done').expect(400);
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes the todo, then reports it missing', async () => {
    const { _id } = await createTodo();
    await request(app).delete(`/api/todos/${_id}`).expect(204);
    await request(app).delete(`/api/todos/${_id}`).expect(404);
  });
});
