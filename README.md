# hiring-fullstack-todo

A small full-stack TODO app. The list is styled as a shop receipt: add a line, tick it off, and it gets stamped DONE.

It's a monorepo built on npm workspaces, with Turborepo running tasks across the two apps:

- [`client/`](client/README.md): React 19 + TypeScript, built with Vite
- [`server/`](server/README.md): Express 5 + TypeScript, MongoDB through Mongoose

## Run it locally

You need Node.js 22.12 or newer and a MongoDB connection string, either Atlas or local. See [MongoDB connection](server/README.md#mongodb-connection).

```bash
npm install                          # installs both apps
cp server/.env.example server/.env   # then set MONGODB_URI
npm run dev                          # API on :4000, client on :5173
```

Open http://localhost:5173.

The other root scripts: `npm run build`, `npm run lint` and `npm run typecheck` run in both apps, `npm test` runs the server's tests, and `npm run format` runs Prettier over the repo. Turborepo runs the per-app scripts in parallel and caches the results, so a repeat run with no changes finishes almost instantly.

## How it fits together

The client calls `/api/todos`. In development, Vite proxies `/api` to the server on port 4000, so the browser talks to a single origin and the server needs no CORS setup. The server validates request bodies with zod, stores todos in MongoDB and returns JSON.

## Decisions and trade-offs

### Monorepo

I used npm workspaces with Turborepo: one install, one lockfile, and one `npm run dev` that starts both apps. I stayed on npm rather than pnpm so nobody needs another tool to run it. The apps don't share code. The only overlap is the two length limits, which are duplicated with a comment pointing at the server, because a shared package would need its own build step just for those.

### State on the client

There's no data-fetching library. A `useTodos` hook holds the list, tracks loading and errors, and makes create, update, toggle and delete optimistic: the list changes straight away, and only the affected todo rolls back if the request fails. A failed create or edit puts the typed text back, so nothing is lost. For one list on one page, TanStack Query would add more concepts than it would remove code.

### Toggling

`PATCH /api/todos/:id/done` flips `done` inside MongoDB with an update pipeline instead of reading the todo and writing it back, so two quick toggles can't race each other.

### Tests

Only the server is tested. Its integration tests run against an in-memory MongoDB, so they never touch real data, and they cover the API contract including the error cases. I checked the client's rollbacks by hand; the first client test I'd add is a failed toggle rolling back.
