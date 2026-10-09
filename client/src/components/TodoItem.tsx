import { useState } from 'react';
import type { Todo, TodoInput } from '../api';
import { TodoForm } from './TodoForm';

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
      <li>
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
    <li aria-busy={isPending}>
      <input
        type="checkbox"
        checked={todo.done}
        disabled={isPending}
        onChange={() => onToggle(todo)}
        aria-label={`Mark "${todo.title}" as ${todo.done ? 'not done' : 'done'}`}
      />
      <div>
        <p>{todo.title}</p>
        {todo.description && <p>{todo.description}</p>}
      </div>
      <button
        onClick={() => setIsEditing(true)}
        disabled={isPending}
        aria-label={`Edit "${todo.title}"`}
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(todo)}
        disabled={isPending}
        aria-label={`Delete "${todo.title}"`}
      >
        Delete
      </button>
    </li>
  );
}
