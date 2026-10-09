import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { errorMessage, type Todo, type TodoInput } from '../api';
import { isUnsaved } from '../useTodos';
import { Pencil, Trash2 } from 'lucide-react';
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
  // A save that failed reopens the editor with the user's text and the reason.
  const [failedEdit, setFailedEdit] = useState<{ input: TodoInput; error: string } | null>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocus = useRef(false);

  // After the editor closes, give focus back to the Edit button once it's enabled again.
  useEffect(() => {
    if (shouldRestoreFocus.current && !isEditing && !isPending) {
      shouldRestoreFocus.current = false;
      editButtonRef.current?.focus();
    }
  }, [isEditing, isPending]);

  function openEditor() {
    if (isPending) return;
    setFailedEdit(null);
    setIsEditing(true);
  }

  function closeEditor() {
    shouldRestoreFocus.current = true;
    setIsEditing(false);
  }

  // Optimistic: close at once and show the new text; reopen with it if the save fails.
  async function saveEdit(input: TodoInput) {
    closeEditor();
    try {
      await onEdit(todo, input);
    } catch (error) {
      shouldRestoreFocus.current = false;
      setFailedEdit({ input, error: errorMessage(error) });
      setIsEditing(true);
    }
  }

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    if (isPending) return;
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
          initial={failedEdit?.input ?? { title: todo.title, description: todo.description ?? '' }}
          initialError={failedEdit?.error}
          submitLabel="Save"
          onSubmit={saveEdit}
          onCancel={closeEditor}
        />
      </li>
    );
  }

  // A todo that isn't saved yet can't be acted on. A saved todo with a request in flight
  // ignores repeat actions but doesn't change how it looks, so optimistic updates don't flash.
  const unsaved = isUnsaved(todo);

  // Only a just-added todo prints in; the saved copy that replaces it appears without animating.
  const rowClass = [styles.item, todo.done && styles.done, unsaved && styles.printing]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={rowClass} aria-busy={isPending}>
      <input
        className={styles.checkbox}
        type="checkbox"
        checked={todo.done}
        disabled={unsaved}
        aria-disabled={isPending}
        onChange={() => {
          if (!isPending) onToggle(todo);
        }}
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
            onClick={openEditor}
            disabled={unsaved}
            aria-disabled={isPending}
            aria-label={`Edit "${todo.title}"`}
            title="Edit"
          >
            <Pencil size={18} strokeWidth={1.75} aria-hidden />
          </button>
          <button
            className={`${styles.iconButton} ${styles.delete}`}
            onClick={handleDelete}
            disabled={unsaved}
            aria-disabled={isPending}
            aria-label={`Delete "${todo.title}"`}
            title="Delete"
          >
            <Trash2 size={18} strokeWidth={1.75} aria-hidden />
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
