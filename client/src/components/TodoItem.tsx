import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Todo, TodoInput } from '../api';
import { PencilIcon, TrashIcon } from './icons';
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
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  // When the editor closes (Save or Cancel), give focus back to this row's Edit button.
  useEffect(() => {
    if (wasEditing.current && !isEditing) editButtonRef.current?.focus();
    wasEditing.current = isEditing;
  }, [isEditing]);

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    // Move focus to a neighbouring row first, so keyboard users keep their place in the list.
    const row = event.currentTarget.closest('li');
    const neighbour = row?.nextElementSibling ?? row?.previousElementSibling;
    neighbour?.querySelector<HTMLElement>('input')?.focus();
    onDelete(todo);
  }

  if (isEditing) {
    return (
      <li className={styles.item}>
        <TodoForm
          initial={{ title: todo.title, description: todo.description ?? '' }}
          submitLabel="Save"
          onSubmit={async (input) => {
            // Closes only once saved; if the save fails, the form stays open with the text.
            await onEdit(todo, input);
            setIsEditing(false);
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
      <div className={styles.side}>
        <div className={styles.actions}>
          <button
            ref={editButtonRef}
            className={styles.iconButton}
            onClick={() => setIsEditing(true)}
            disabled={isPending}
            aria-label={`Edit "${todo.title}"`}
            title="Edit"
          >
            <PencilIcon />
          </button>
          <button
            className={`${styles.iconButton} ${styles.delete}`}
            onClick={handleDelete}
            disabled={isPending}
            aria-label={`Delete "${todo.title}"`}
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
        {todo.done && (
          <span className={styles.stamp} aria-hidden="true">
            Done
          </span>
        )}
      </div>
    </li>
  );
}
