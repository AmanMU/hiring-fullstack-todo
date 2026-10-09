import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { useTodos } from './useTodos';

function App() {
  const {
    todos,
    loadState,
    reload,
    actionError,
    dismissError,
    pendingIds,
    createTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
  } = useTodos();

  return (
    <main>
      <h1>Todos</h1>
      <TodoForm submitLabel="Add todo" onSubmit={createTodo} />

      {actionError && (
        <div role="alert">
          <span>{actionError}</span>
          <button onClick={dismissError}>Dismiss</button>
        </div>
      )}

      {loadState === 'loading' && <p>Loading todos…</p>}

      {loadState === 'error' && (
        <div role="alert">
          <p>Could not load your todos.</p>
          <button onClick={reload}>Try again</button>
        </div>
      )}

      {loadState === 'ready' && todos.length === 0 && <p>No todos yet. Add one above.</p>}

      {loadState === 'ready' && todos.length > 0 && (
        <ul>
          {todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              isPending={pendingIds.has(todo._id)}
              onToggle={toggleTodo}
              onEdit={editTodo}
              onDelete={deleteTodo}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
