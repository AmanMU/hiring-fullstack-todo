import { useState, type FormEvent } from 'react';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, type TodoInput } from '../api';

type TodoFormProps = {
  initial?: TodoInput;
  submitLabel: string;
  onSubmit: (input: TodoInput) => Promise<void>;
  onCancel?: () => void;
};

const EMPTY_INPUT: TodoInput = { title: '', description: '' };

// Used to add a todo and, with `initial` and `onCancel`, to edit one in place.
export function TodoForm({
  initial = EMPTY_INPUT,
  submitLabel,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = { title: title.trim(), description: description.trim() };
    if (!input.title) {
      setError('Title is required');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(input);
      setTitle('');
      setDescription('');
    } catch (submitError) {
      // Keep what the user typed so they can retry.
      setError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input
        aria-label="Title"
        placeholder="What needs doing?"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        onChange={(event) => setTitle(event.target.value)}
        aria-invalid={error !== null}
        autoFocus={onCancel !== undefined}
      />
      <textarea
        aria-label="Description (optional)"
        placeholder="Description (optional)"
        value={description}
        maxLength={DESCRIPTION_MAX_LENGTH}
        onChange={(event) => setDescription(event.target.value)}
      />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
