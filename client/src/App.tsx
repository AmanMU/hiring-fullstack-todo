import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { useTodos } from './useTodos';
import styles from './App.module.css';

const PRINTED_ON = new Date().toLocaleDateString(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

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

  const isEmpty = loadState === 'ready' && todos.length === 0;
  const hasTodos = loadState === 'ready' && todos.length > 0;
  const doneCount = todos.filter((todo) => todo.done).length;

  return (
    <main className={styles.counter}>
      <div className={styles.receipt}>
        <header className={styles.header}>
          <h1 className={styles.heading}>
            Things to do
            {hasTodos && (
              <span className={styles.count}>
                {' '}
                ({doneCount}/{todos.length})
              </span>
            )}
          </h1>
          <p className={styles.date}>{PRINTED_ON}</p>
        </header>

        <section className={styles.section}>
          <TodoForm submitLabel="Add todo" onSubmit={createTodo} />
        </section>

        {actionError && (
          <div className={`${styles.section} ${styles.alert}`} role="alert">
            <p>{actionError}</p>
            <button onClick={dismissError}>Dismiss</button>
          </div>
        )}

        <section className={styles.section}>
          {loadState === 'loading' && <p className={styles.status}>Loading your list…</p>}

          {loadState === 'error' && (
            <div className={styles.alert} role="alert">
              <p>Could not load your todos.</p>
              <button onClick={reload}>Try again</button>
            </div>
          )}

          {isEmpty && (
            <p className={styles.status}>Nothing on the list yet. Add your first todo above.</p>
          )}

          {hasTodos && (
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
        </section>
      </div>
    </main>
  );
}

export default App;
