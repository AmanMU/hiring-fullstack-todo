import { Schema, model } from 'mongoose';

export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 1000;

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: TITLE_MAX_LENGTH },
    description: { type: String, trim: true, maxlength: DESCRIPTION_MAX_LENGTH },
    done: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

// Backs the newest-first list query; _id breaks ties between todos created in the same millisecond.
todoSchema.index({ createdAt: -1, _id: -1 });

export const TodoModel = model('Todo', todoSchema);
