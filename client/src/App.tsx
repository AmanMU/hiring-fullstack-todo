import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { useTodos } from './useTodos';
import styles from './App.module.css';

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
    <main className={styles.main}>
      <h1 className={styles.heading}>Todos</h1>
      <TodoForm submitLabel="Add todo" onSubmit={createTodo} />

      {actionError && (
        <div className={styles.banner} role="alert">
          <p>{actionError}</p>
          <button onClick={dismissError}>Dismiss</button>
        </div>
      )}

      {loadState === 'loading' && <p className={styles.status}>Loading todos…</p>}

      {loadState === 'error' && (
        <div className={styles.banner} role="alert">
          <p>Could not load your todos.</p>
          <button onClick={reload}>Try again</button>
        </div>
      )}

      {loadState === 'ready' && todos.length === 0 && (
        <p className={styles.status}>No todos yet. Add one above.</p>
      )}

      {loadState === 'ready' && todos.length > 0 && (
        <ul className={styles.list}>
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
