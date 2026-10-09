import { Schema, model } from 'mongoose';

export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 1000;

// _id breaks ties between todos created in the same millisecond
export const NEWEST_FIRST = { createdAt: -1, _id: -1 } as const;

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: TITLE_MAX_LENGTH },
    description: { type: String, trim: true, maxlength: DESCRIPTION_MAX_LENGTH },
    done: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

todoSchema.index(NEWEST_FIRST);

export const TodoModel = model('Todo', todoSchema);
