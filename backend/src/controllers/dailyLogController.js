import { DailyLog } from "../models/DailyLog.js";
import { ApiError } from "../utils/apiError.js";
import { createCrudController } from "./createCrudController.js";
import { startOfDay } from "../utils/date.js";

const normalizeDate = (payload) => ({
  ...payload,
  date: startOfDay(payload.date || new Date()),
});

export const dailyLogController = createCrudController({
  Model: DailyLog,
  searchFields: ["wins", "blockers", "gratitude"],
  filterFields: ["mood", "flagged"],
  sortFields: ["createdAt", "updatedAt", "date", "energy", "focus"],
  dateField: "date",
  allowedCreateFields: ["date", "mood", "energy", "focus", "wins", "blockers", "gratitude"],
  allowedUpdateFields: ["date", "mood", "energy", "focus", "wins", "blockers", "gratitude"],
  transformCreate: async (payload) => normalizeDate(payload),
  transformUpdate: async (changes, item) => ({
    ...changes,
    date: changes.date ? startOfDay(changes.date) : item.date,
  }),
});

const originalCreate = dailyLogController.create;

dailyLogController.create = async (req, res, next) => {
  try {
    const normalizedDate = startOfDay(req.body.date || new Date());
    const existing = await DailyLog.findOne({
      userId: req.user._id,
      date: normalizedDate,
    });

    if (existing) {
      throw new ApiError(409, "A daily log already exists for this date.");
    }

    req.body.date = normalizedDate;
    return originalCreate(req, res, next);
  } catch (error) {
    return next(error);
  }
};
