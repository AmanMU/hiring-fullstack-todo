# Client

The React 19 front end for the TODO app, written in TypeScript and built with Vite.

## Running it

Run everything from the repo root (see the [root README](../README.md)). To work on the client alone, with the server already running on port 4000:

```bash
npm run dev
```

| Command             | What it does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server with hot reload |
| `npm run build`     | Type-check and build to `dist/`      |
| `npm run typecheck` | Type-check only                      |
| `npm run lint`      | Lint with Oxlint                     |
| `npm run preview`   | Serve the production build locally   |

## How it works

- `src/api.ts` is a small `fetch` wrapper. Every failure becomes an `Error` whose message is safe to show the user.
- `src/useTodos.ts` holds the list and its loading state, and exposes create, update, toggle and delete.
- Every action is optimistic: the list changes at once, and if the request fails, only that todo rolls back. While a todo has a request in flight its controls ignore clicks, so a double click can't send two toggles. They aren't disabled, because that would make the row flash. A new todo's controls do stay disabled until the server returns its real id.
- A new todo appears straight away, faded, and is swapped for the saved copy when the server answers. If the save fails, the row disappears and your text goes back into the form with the reason. A failed edit reopens the editor with your text. Toggle and delete failures show in a banner you can dismiss.
- `src/components/TodoForm.tsx` is used both to add a todo and to edit one in place. The title field has focus when the page opens, so you can start typing straight away.

## Assumptions and limitations

- The API is expected on the same origin under `/api`, which Vite's proxy provides in development. A production deploy needs the same reverse proxy, or a configurable API URL plus CORS on the server.
- The only check before sending is that the title isn't blank. The length limits come from `maxLength` and mirror the server's (see `src/api.ts`); the server stays the source of truth.
- No offline support and no live sync: changes made in another tab show up after a reload.
- No client tests (see the root README).
- The receipt stays light in dark mode on purpose: it's a piece of paper on a dark counter.
