import { Goal } from "../models/Goal.js";
import { createCrudController } from "./createCrudController.js";

export const goalController = createCrudController({
  Model: Goal,
  searchFields: ["title", "description", "category"],
  filterFields: ["status", "priority", "category", "flagged"],
  sortFields: ["createdAt", "updatedAt", "progress", "targetDate"],
  allowedCreateFields: [
    "title",
    "description",
    "category",
    "priority",
    "status",
    "progress",
    "targetDate",
  ],
  allowedUpdateFields: [
    "title",
    "description",
    "category",
    "priority",
    "status",
    "progress",
    "targetDate",
  ],
});
