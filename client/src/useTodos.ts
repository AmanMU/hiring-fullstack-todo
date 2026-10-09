import { useEffect, useState } from 'react';
import { todosApi, type Todo, type TodoInput } from './api';

type LoadState = 'loading' | 'error' | 'ready';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());

  // Runs on mount and again on each retry; aborting stops a stale response from landing.
  useEffect(() => {
    const controller = new AbortController();
    todosApi.list(controller.signal).then(
      (list) => {
        setTodos(list);
        setLoadState('ready');
      },
      () => {
        if (!controller.signal.aborted) setLoadState('error');
      },
    );
    return () => controller.abort();
  }, [loadAttempt]);

  function reload() {
    setLoadState('loading');
    setLoadAttempt((attempt) => attempt + 1);
  }

  const replaceTodo = (todo: Todo) =>
    setTodos((current) => current.map((t) => (t._id === todo._id ? todo : t)));

  // Marks the todo busy (its controls disable) and reports a failure in the error banner.
  async function trackPending(id: string, action: () => Promise<void>) {
    setPendingIds((ids) => new Set(ids).add(id));
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    } finally {
      setPendingIds((ids) => new Set([...ids].filter((pendingId) => pendingId !== id)));
    }
  }

  // Shows `optimistic` at once, then the server's copy; restores `original` if the request fails.
  const updateOptimistically = (original: Todo, optimistic: Todo, send: () => Promise<Todo>) =>
    trackPending(original._id, async () => {
      replaceTodo(optimistic);
      try {
        replaceTodo(await send());
      } catch (error) {
        replaceTodo(original);
        throw error;
      }
    });

  const toggleTodo = (todo: Todo) =>
    updateOptimistically(todo, { ...todo, done: !todo.done }, () => todosApi.toggle(todo._id));

  const editTodo = (todo: Todo, input: TodoInput) =>
    updateOptimistically(
      todo,
      { ...todo, title: input.title, description: input.description || undefined },
      () => todosApi.update(todo._id, input),
    );

  const deleteTodo = (todo: Todo) =>
    trackPending(todo._id, async () => {
      setTodos((current) => current.filter((t) => t._id !== todo._id));
      try {
        await todosApi.remove(todo._id);
      } catch (error) {
        setTodos((current) => [...current, todo].sort(newestFirst));
        throw error;
      }
    });

  // Not optimistic: the form shows "Adding…" and keeps its text if this throws.
  async function createTodo(input: TodoInput) {
    const todo = await todosApi.create(input);
    setTodos((current) => [todo, ...current]);
  }

  return {
    todos,
    loadState,
    reload,
    actionError,
    dismissError: () => setActionError(null),
    pendingIds,
    createTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
  };
}

function newestFirst(a: Todo, b: Todo) {
  return b.createdAt.localeCompare(a.createdAt) || b._id.localeCompare(a._id);
}
