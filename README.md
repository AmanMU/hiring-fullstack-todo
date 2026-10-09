# hiring-fullstack-todo

A small full-stack TODO app. The list is styled as a shop receipt: add a line, tick it off, and it gets stamped DONE.

- [`client/`](client/README.md): React 19 + TypeScript, built with Vite
- [`server/`](server/README.md): Express 5 + TypeScript, MongoDB through Mongoose

## Run it locally

You need Node.js 22.12 or newer and a MongoDB connection string, either Atlas or local. See [MongoDB connection](server/README.md#mongodb-connection).

1. Start the API:

   ```bash
   cd server
   npm install
   cp .env.example .env   # then set MONGODB_URI
   npm run dev
   ```

2. In a second terminal, start the client:

   ```bash
   cd client
   npm install
   npm run dev
   ```

3. Open http://localhost:5173.

## How it fits together

The client calls `/api/todos`. In development, Vite proxies `/api` to the server on port 4000, so the browser talks to a single origin and the server needs no CORS setup. The server validates every request with zod, stores todos in MongoDB and returns JSON.

## Decisions and trade-offs

- **Two independent apps, not a monorepo.** The brief offers a bonus for a monorepo; I kept `client/` and `server/` as separate npm projects to keep the setup small. The only thing they share is two length limits, which are duplicated with a comment pointing at the server.
- **No data-fetching library.** A ~120-line `useTodos` hook holds the list, tracks loading and errors, and applies create, edit, toggle and delete optimistically, rolling back only the affected todo on failure. A failed create or edit gives the typed text back. For one list on one page, TanStack Query would add concepts without removing much code.
- **Atomic toggle.** `PATCH /api/todos/:id/done` flips `done` inside MongoDB with an update pipeline, so two quick toggles can't race each other into the wrong state.
- **Tests where the logic is.** The server has integration tests that run against an in-memory MongoDB, so they never touch real data. The client has none.
