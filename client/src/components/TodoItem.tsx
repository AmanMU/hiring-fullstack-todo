import { useState } from 'react';
import type { Todo, TodoInput } from '../api';
import { TodoForm } from './TodoForm';
import styles from './TodoItem.module.css';

type TodoItemProps = {
  todo: Todo;
  isPending: boolean;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo, input: TodoInput) => Promise<void>;
  onDelete: (todo: Todo) => void;
};

export function TodoItem({ todo, isPending, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <li className={styles.item}>
        <TodoForm
          initial={{ title: todo.title, description: todo.description ?? '' }}
          submitLabel="Save"
          onSubmit={(input) => {
            // The edit is optimistic, so close the form right away.
            setIsEditing(false);
            return onEdit(todo, input);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className={`${styles.item} ${todo.done ? styles.done : ''}`} aria-busy={isPending}>
      <input
        className={styles.checkbox}
        type="checkbox"
        checked={todo.done}
        disabled={isPending}
        onChange={() => onToggle(todo)}
        aria-label={`Mark "${todo.title}" as ${todo.done ? 'not done' : 'done'}`}
      />
      <div className={styles.content}>
        <p className={styles.title}>{todo.title}</p>
        {todo.description && <p className={styles.description}>{todo.description}</p>}
      </div>
      <div className={styles.actions}>
        <button
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          aria-label={`Edit "${todo.title}"`}
        >
          Edit
        </button>
        <button
          className={styles.delete}
          onClick={() => onDelete(todo)}
          disabled={isPending}
          aria-label={`Delete "${todo.title}"`}
        >
          Delete
        </button>
      </div>
      {todo.done && (
        <span className={styles.stamp} aria-hidden="true">
          Done
        </span>
      )}
    </li>
  );
}
