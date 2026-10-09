# Client

The React 19 and TypeScript front end for the TODO app, built with Vite. The list is styled as a shop receipt.

## Setup and run

Requires Node.js 22.12 or newer, and the [server](../server/README.md) running on port 4000.

```bash
npm install
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` requests to `http://localhost:4000` (see `vite.config.ts`).

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with hot reload |
| `npm run build`   | Type-check and build to `dist/`      |
| `npm run lint`    | Lint with Oxlint                     |
| `npm run preview` | Serve the production build locally   |

## How it works

- `src/api.ts` is a small `fetch` wrapper. Every failure becomes an `Error` whose message is safe to show the user.
- `src/useTodos.ts` holds the list and its loading state, and exposes create, toggle, edit and delete.
- Toggle and delete are optimistic. The UI changes at once, and if the request fails, that one item rolls back and a dismissible banner says why. While an item has a request in flight its controls are disabled, so a double click can't send two toggles.
- Create and edit wait for the server, so the form can keep what you typed if the save fails, and show the reason under the inputs.
- `src/components/TodoForm.tsx` is used both to add a todo and to edit one in place. The title field takes focus when the app opens, so you can start typing straight away.

## Assumptions and limitations

- The API is assumed to be on the same origin under `/api`, which the Vite proxy provides in development. A production deploy needs the same reverse-proxy setup, or a configurable API URL plus CORS on the server.
- Client-side validation only checks that the title isn't blank. The length limits (200 for a title, 1000 for a description) are enforced with `maxLength` and mirror the server, which remains the source of truth.
- No offline support and no live sync: changes made in another tab appear after a reload.
- No client tests; the API is covered by the server's tests.
- The receipt stays light in dark mode on purpose, as a paper object on a dark counter.
