import { Transaction } from "../models/Transaction.js";
import { createCrudController } from "./createCrudController.js";

export const transactionController = createCrudController({
  Model: Transaction,
  searchFields: ["title", "category", "note", "paymentMethod"],
  filterFields: ["type", "category", "flagged"],
  sortFields: ["createdAt", "updatedAt", "date", "amount"],
  dateField: "date",
  allowedCreateFields: [
    "title",
    "type",
    "amount",
    "category",
    "date",
    "note",
    "paymentMethod",
  ],
  allowedUpdateFields: [
    "title",
    "type",
    "amount",
    "category",
    "date",
    "note",
    "paymentMethod",
  ],
});
