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

From the root, `npm run build`, `npm run lint`, `npm run typecheck` and `npm test` run the matching script in each app. Turborepo runs them in parallel and caches the results, so a repeat run with no changes finishes instantly.

## How it fits together

The client calls `/api/todos`. In development, Vite proxies `/api` to the server on port 4000, so the browser talks to a single origin and the server needs no CORS setup. The server validates every request with zod, stores todos in MongoDB and returns JSON.

## Decisions and trade-offs

- **npm workspaces + Turborepo.** One install, one lockfile and one `npm run dev` for both apps. Turborepo adds parallel runs and caching with a 15-line `turbo.json`. I chose npm over pnpm so reviewers don't need another tool. The apps share only two length limits, duplicated with a comment pointing at the server; a shared package would need its own build step for that.
- **No data-fetching library.** A ~130-line `useTodos` hook holds the list, tracks loading and errors, and applies create, edit, toggle and delete optimistically, rolling back only the affected todo on failure. A failed create or edit gives the typed text back. For one list on one page, TanStack Query would add concepts without removing much code.
- **Atomic toggle.** `PATCH /api/todos/:id/done` flips `done` inside MongoDB with an update pipeline, so two quick toggles can't race each other into the wrong state.
- **Tests where the logic is.** The server has integration tests that run against an in-memory MongoDB, so they never touch real data. The client has none.
