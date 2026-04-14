import { Todo } from "../models/Todo.js";
import { createCrudController } from "./createCrudController.js";

const completeTimestamp = (changes) => ({
  ...changes,
  completedAt:
    changes.status === "completed"
      ? new Date()
      : changes.status
        ? null
        : changes.completedAt,
});

export const todoController = createCrudController({
  Model: Todo,
  searchFields: ["title", "description", "tags"],
  filterFields: ["status", "priority", "flagged"],
  sortFields: ["createdAt", "updatedAt", "dueDate", "priority"],
  allowedCreateFields: [
    "title",
    "description",
    "status",
    "priority",
    "dueDate",
    "tags",
  ],
  allowedUpdateFields: [
    "title",
    "description",
    "status",
    "priority",
    "dueDate",
    "tags",
  ],
  transformCreate: async (payload) => completeTimestamp(payload),
  transformUpdate: async (changes) => completeTimestamp(changes),
});
