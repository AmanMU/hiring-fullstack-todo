export type Todo = {
  _id: string;
  title: string;
  description?: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

// The form always sends both fields; an empty description clears it on the server.
export type TodoInput = { title: string; description: string };

// Keep in sync with server/src/todo.model.ts.
export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 1000;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: TodoInput;
  signal?: AbortSignal;
};

const NETWORK_ERROR = 'Could not reach the server. Check that it is running and try again.';
const SERVER_ERROR = 'Something went wrong. Please try again.';

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : SERVER_ERROR;
}

export const todosApi = {
  list: (signal?: AbortSignal) => request<Todo[]>('', { signal }),
  create: (input: TodoInput) => request<Todo>('', { method: 'POST', body: input }),
  update: (id: string, input: TodoInput) => request<Todo>(`/${id}`, { method: 'PUT', body: input }),
  toggle: (id: string) => request<Todo>(`/${id}/done`, { method: 'PATCH' }),
  remove: (id: string) => request<void>(`/${id}`, { method: 'DELETE' }),
};

// Resolves with the parsed JSON, or rejects with an Error whose message is safe to show the user.
async function request<T>(path: string, { method = 'GET', body, signal }: RequestOptions) {
  let res: Response;
  try {
    res = await fetch(`/api/todos${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(NETWORK_ERROR);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message ?? SERVER_ERROR);
  return data as T;
}
