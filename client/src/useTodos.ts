import { useEffect, useState } from 'react';
import { errorMessage, todosApi, type Todo, type TodoInput } from './api';

type LoadState = 'loading' | 'error' | 'ready';

const UNSAVED_ID_PREFIX = 'unsaved-';

export function isUnsaved(todo: Todo) {
  return todo._id.startsWith(UNSAVED_ID_PREFIX);
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());

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

  async function whilePending(id: string, action: () => Promise<void>) {
    setPendingIds((ids) => new Set(ids).add(id));
    try {
      await action();
    } finally {
      setPendingIds((ids) => new Set([...ids].filter((pendingId) => pendingId !== id)));
    }
  }

  const reportErrors = (action: Promise<void>) =>
    action.catch((error) => setActionError(errorMessage(error)));

  // toggle/delete report failures in the banner; create/edit rethrow so the form can restore the text

  const toggleTodo = (todo: Todo) =>
    reportErrors(
      whilePending(todo._id, async () => {
        replaceTodo({ ...todo, done: !todo.done });
        try {
          replaceTodo(await todosApi.toggle(todo._id));
        } catch (error) {
          replaceTodo(todo);
          throw error;
        }
      }),
    );

  const deleteTodo = (todo: Todo) =>
    reportErrors(
      whilePending(todo._id, async () => {
        setTodos((current) => current.filter((t) => t._id !== todo._id));
        try {
          await todosApi.remove(todo._id);
        } catch (error) {
          setTodos((current) => [...current, todo].sort(newestFirst));
          throw error;
        }
      }),
    );

  function createTodo(input: TodoInput) {
    const now = new Date().toISOString();
    const unsaved: Todo = {
      _id: `${UNSAVED_ID_PREFIX}${crypto.randomUUID()}`,
      title: input.title,
      description: input.description || undefined,
      done: false,
      createdAt: now,
      updatedAt: now,
    };
    return whilePending(unsaved._id, async () => {
      setTodos((current) => [unsaved, ...current]);
      try {
        const saved = await todosApi.create(input);
        setTodos((current) => current.map((t) => (t._id === unsaved._id ? saved : t)));
      } catch (error) {
        setTodos((current) => current.filter((t) => t._id !== unsaved._id));
        throw error;
      }
    });
  }

  const editTodo = (todo: Todo, input: TodoInput) =>
    whilePending(todo._id, async () => {
      replaceTodo({ ...todo, title: input.title, description: input.description || undefined });
      try {
        replaceTodo(await todosApi.update(todo._id, input));
      } catch (error) {
        replaceTodo(todo);
        throw error;
      }
    });

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
