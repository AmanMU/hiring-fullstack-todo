import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { errorMessage, type Todo, type TodoInput } from '../api';
import { isUnsaved } from '../useTodos';
import { TodoForm } from './TodoForm';
import styles from './TodoItem.module.css';

type TodoItemProps = {
  todo: Todo;
  isPending: boolean;
  onUpdate: (todo: Todo, input: TodoInput) => Promise<void>;
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
};

export function TodoItem({ todo, isPending, onUpdate, onToggle, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [failedEdit, setFailedEdit] = useState<{ input: TodoInput; error: string } | null>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocus = useRef(false);

  useEffect(() => {
    if (shouldRestoreFocus.current && !isEditing) {
      shouldRestoreFocus.current = false;
      editButtonRef.current?.focus();
    }
  }, [isEditing]);

  function openEditor() {
    if (isPending) return;
    setFailedEdit(null);
    setIsEditing(true);
  }

  function closeEditor() {
    shouldRestoreFocus.current = true;
    setIsEditing(false);
  }

  async function saveEdit(input: TodoInput) {
    closeEditor();
    try {
      await onUpdate(todo, input);
    } catch (error) {
      setFailedEdit({ input, error: errorMessage(error) });
      setIsEditing(true);
    }
  }

  function handleToggle() {
    if (isPending) return;
    onToggle(todo);
  }

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    if (isPending) return;
    const row = event.currentTarget.closest('li');
    const neighbour = row?.nextElementSibling ?? row?.previousElementSibling;
    neighbour?.querySelector<HTMLInputElement>('input[type="checkbox"]:not(:disabled)')?.focus();
    onDelete(todo);
  }

  if (isEditing) {
    return (
      <li className={`${styles.item} ${styles.editing}`}>
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

  // unsaved rows are disabled; pending rows only ignore clicks, so optimistic updates don't flash
  const unsaved = isUnsaved(todo);
  const rowClass = [styles.item, todo.done && styles.done, unsaved && styles.unsaved]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={rowClass}>
      <input
        className={styles.checkbox}
        type="checkbox"
        checked={todo.done}
        disabled={unsaved}
        aria-disabled={isPending}
        onChange={handleToggle}
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
          <span className={styles.stamp} aria-hidden>
            Done
          </span>
        )}
      </div>
    </li>
  );
}
