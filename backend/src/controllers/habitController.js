import { Habit } from "../models/Habit.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createCrudController } from "./createCrudController.js";
import { startOfDay } from "../utils/date.js";

export const habitController = createCrudController({
  Model: Habit,
  searchFields: ["name", "description"],
  filterFields: ["frequency", "archived", "flagged"],
  sortFields: ["createdAt", "updatedAt", "streak", "bestStreak"],
  allowedCreateFields: [
    "name",
    "description",
    "frequency",
    "targetCount",
    "archived",
  ],
  allowedUpdateFields: [
    "name",
    "description",
    "frequency",
    "targetCount",
    "archived",
  ],
});

export const checkInHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!habit) {
    throw new ApiError(404, "Habit not found.");
  }

  const completionDate = startOfDay(req.body.date || new Date());
  const alreadyCompleted = habit.completions.some(
    (entry) => startOfDay(entry).getTime() === completionDate.getTime(),
  );

  if (alreadyCompleted) {
    throw new ApiError(400, "This habit has already been checked in for the selected date.");
  }

  if (!habit.lastCompletedAt) {
    habit.streak = 1;
  } else {
    const lastCompleted = startOfDay(habit.lastCompletedAt);
    const diffDays = Math.round(
      (completionDate.getTime() - lastCompleted.getTime()) / (24 * 60 * 60 * 1000),
    );

    if (habit.frequency === "weekly") {
      habit.streak = diffDays <= 7 ? habit.streak + 1 : 1;
    } else {
      habit.streak = diffDays === 1 ? habit.streak + 1 : 1;
    }
  }

  habit.bestStreak = Math.max(habit.bestStreak, habit.streak);
  habit.lastCompletedAt = completionDate;
  habit.completions.push(completionDate);
  await habit.save();

  res.json({
    message: "Habit check-in recorded successfully.",
    data: habit,
  });
});
