# Server

REST API for the TODO app: Express 5 and TypeScript, with data in MongoDB through Mongoose.

## Running it

Run everything from the repo root (see the [root README](../README.md)). The server needs a `.env` file:

```bash
cp .env.example .env
```

Set `MONGODB_URI` in it (see [MongoDB connection](#mongodb-connection)). To work on the server alone:

| Command                           | What it does                                       |
| --------------------------------- | -------------------------------------------------- |
| `npm run dev`                     | Start on port 4000 and restart when a file changes |
| `npm test`                        | Run the API tests against an in-memory MongoDB     |
| `npm run build`, then `npm start` | Compile to `dist/` and run the compiled server     |
| `npm run typecheck`               | Type-check, including the tests                    |
| `npm run lint`                    | Lint with Oxlint                                   |

| Variable      | Required | Default |
| ------------- | -------- | ------- |
| `MONGODB_URI` | yes      |         |
| `PORT`        | no       | `4000`  |

## Project structure

```
src/
  index.ts                  Reads env, connects to MongoDB, starts listening, shuts down cleanly
  app.ts                    createApp(): middleware and routes, no DB access (tests use it directly)
  routes/                   URL paths mapped to controller functions
  controllers/              The five request handlers
  models/                   Mongoose schema and length limits
  validators/               zod request-body schemas and the :id check
  middleware/               HttpError, the 404 handler and the JSON error handler
test/                       API tests with supertest against an in-memory MongoDB
```

There's no service layer: with five handlers of a few lines each, it would only pass calls through.

## MongoDB connection

**Atlas (what I used).** Create a free M0 cluster, add a database user, and add your IP address under Network Access. Copy the driver connection string and add the database name after `.net/`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/todo-app?retryWrites=true&w=majority
```

Without `/todo-app`, Mongoose writes to a database called `test`. If the password contains any of `@ : / ? # %`, percent-encode them.

**Local, with Docker.**

```bash
docker run -d --name todo-mongo -p 27017:27017 mongo:8
```

```
MONGODB_URI=mongodb://127.0.0.1:27017/todo-app
```

Use `127.0.0.1` rather than `localhost`: Node can resolve `localhost` to IPv6, where mongod isn't listening.

If the server can't reach MongoDB within 5 seconds, it exits with a message. On Atlas, the cause is almost always the IP access list.

The tests need neither: they start a throwaway in-memory MongoDB. Its binary downloads on the first run.

## API

Responses are JSON, except the empty 204 from DELETE. Errors have one shape: `{ "error": { "message": "...", "details": { "title": ["..."] } } }`, where `details` appears only for field validation errors.

| Method | Path                  | Body                                     | Success                          |
| ------ | --------------------- | ---------------------------------------- | -------------------------------- |
| GET    | `/api/todos`          |                                          | 200 with all todos, newest first |
| POST   | `/api/todos`          | `{ title, description? }`                | 201 with the new todo            |
| PUT    | `/api/todos/:id`      | `{ title?, description? }`, at least one | 200 with the updated todo        |
| PATCH  | `/api/todos/:id/done` |                                          | 200 with `done` flipped          |
| DELETE | `/api/todos/:id`      |                                          | 204                              |

Error statuses: 400 for invalid input, a body that isn't a JSON object, or a malformed id; 404 when the todo doesn't exist or the route is unknown; 413 for a body over 10 KB; 500 for anything else. A 500 is logged on the server and never includes a stack trace.

A todo:

```json
{
  "_id": "6ac8e06ffb19ad371957e0a8",
  "title": "Buy milk",
  "description": "2 litres, semi-skimmed",
  "done": false,
  "createdAt": "2026-10-09T12:39:11.106Z",
  "updatedAt": "2026-10-09T12:39:11.106Z"
}
```

## Assumptions and limitations

- Single user, no authentication: anyone who can reach the API can change any todo.
- `PUT` is a partial update of title and/or description, following the brief's wording rather than full replacement. Sending `"description": ""` removes the description.
- Unknown fields are rejected with a 400 rather than ignored, so a client can't set `done` or `_id` through `POST` or `PUT`.
- A title is 1–200 characters after trimming; a description is up to 1000.
- `GET /api/todos` returns every todo; there's no pagination.
- Last write wins. There's no conflict detection if the same todo is edited in two tabs.
- No rate limiting. Security headers come from `helmet`.
