import { useRef, useState, type FormEvent } from 'react';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, errorMessage, type TodoInput } from '../api';
import styles from './TodoForm.module.css';

type TodoFormProps = {
  initial?: TodoInput;
  initialError?: string;
  submitLabel: string;
  onSubmit: (input: TodoInput) => Promise<void>;
  onCancel?: () => void;
};

const EMPTY_INPUT: TodoInput = { title: '', description: '' };

export function TodoForm({
  initial = EMPTY_INPUT,
  initialError,
  submitLabel,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const titleRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = { title: title.trim(), description: description.trim() };
    if (!input.title) {
      setError('Title is required');
      return;
    }

    setError(null);
    setTitle('');
    setDescription('');
    titleRef.current?.focus();
    try {
      await onSubmit(input);
    } catch (submitError) {
      // don't overwrite anything the user has typed since
      setTitle((current) => current || input.title);
      setDescription((current) => current || input.description);
      setError(errorMessage(submitError));
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <input
        ref={titleRef}
        className={styles.title}
        aria-label="Title"
        placeholder="What needs doing?"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        onChange={(event) => setTitle(event.target.value)}
        aria-invalid={error !== null}
        autoFocus
      />
      <textarea
        className={styles.description}
        aria-label="Description (optional)"
        placeholder="Description (optional)"
        value={description}
        maxLength={DESCRIPTION_MAX_LENGTH}
        onChange={(event) => setDescription(event.target.value)}
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button className={styles.submit} type="submit">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
