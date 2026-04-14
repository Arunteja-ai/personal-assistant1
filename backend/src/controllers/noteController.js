import { Note } from "../models/Note.js";
import { createCrudController } from "./createCrudController.js";

const withEditedTimestamp = (changes) => ({
  ...changes,
  lastEditedAt: new Date(),
});

export const noteController = createCrudController({
  Model: Note,
  searchFields: ["title", "content", "tags"],
  filterFields: ["mood", "isPinned", "flagged"],
  sortFields: ["createdAt", "updatedAt", "lastEditedAt"],
  allowedCreateFields: ["title", "content", "mood", "tags", "isPinned"],
  allowedUpdateFields: ["title", "content", "mood", "tags", "isPinned"],
  transformCreate: async (payload) => withEditedTimestamp(payload),
  transformUpdate: async (changes) => withEditedTimestamp(changes),
});
