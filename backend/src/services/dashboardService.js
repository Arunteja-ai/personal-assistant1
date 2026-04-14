import { Goal } from "../models/Goal.js";
import { Todo } from "../models/Todo.js";
import { Transaction } from "../models/Transaction.js";
import { Note } from "../models/Note.js";
import { Habit } from "../models/Habit.js";
import { DailyLog } from "../models/DailyLog.js";
import { addDays, formatDayLabel, formatMonthLabel, startOfDay } from "../utils/date.js";

export const getUserDashboardSummary = async (userId) => {
  const today = startOfDay();
  const weekAgo = addDays(today, -6);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

  const [
    totalGoals,
    completedGoals,
    openTodos,
    todayTodos,
    notesCount,
    habits,
    latestLogs,
    financeAggregate,
    transactionTrendRows,
    activityTodos,
    activityLogs,
    goalBreakdown,
    upcomingGoals,
    recentNotes,
  ] = await Promise.all([
    Goal.countDocuments({ userId }),
    Goal.countDocuments({ userId, status: "completed" }),
    Todo.countDocuments({ userId, status: { $ne: "completed" } }),
    Todo.countDocuments({ userId, status: "today" }),
    Note.countDocuments({ userId }),
    Habit.find({ userId, archived: false }).sort("-streak -bestStreak").limit(5),
    DailyLog.find({ userId }).sort("-date").limit(7),
    Transaction.aggregate([
      { $match: { userId, date: { $gte: monthStart } } },
      { $group: { _id: "$type", amount: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Todo.aggregate([
      { $match: { userId, updatedAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" },
            day: { $dayOfMonth: "$updatedAt" },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
    ]),
    DailyLog.aggregate([
      { $match: { userId, date: { $gte: weekAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          logs: { $sum: 1 },
        },
      },
    ]),
    Goal.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", value: { $sum: 1 } } },
    ]),
    Goal.find({
      userId,
      status: { $ne: "completed" },
      targetDate: { $ne: null },
    })
      .sort("targetDate")
      .limit(5),
    Note.find({ userId }).sort("-updatedAt").limit(5),
  ]);

  const financeMap = financeAggregate.reduce(
    (acc, row) => ({ ...acc, [row._id]: row.amount }),
    { income: 0, expense: 0 },
  );

  const activityMap = new Map();
  for (let i = 0; i < 7; i += 1) {
    const date = addDays(today, -i);
    const key = startOfDay(date).toISOString();
    activityMap.set(key, { date: formatDayLabel(date), todosCompleted: 0, logEntries: 0 });
  }

  for (const row of activityTodos) {
    const key = startOfDay(new Date(row._id.year, row._id.month - 1, row._id.day)).toISOString();
    if (activityMap.has(key)) {
      activityMap.get(key).todosCompleted = row.completed;
    }
  }

  for (const row of activityLogs) {
    const key = startOfDay(new Date(row._id.year, row._id.month - 1, row._id.day)).toISOString();
    if (activityMap.has(key)) {
      activityMap.get(key).logEntries = row.logs;
    }
  }

  const financeByMonth = new Map();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    financeByMonth.set(key, { month: formatMonthLabel(date), income: 0, expense: 0 });
  }

  for (const row of transactionTrendRows) {
    const key = `${row._id.year}-${row._id.month}`;
    if (financeByMonth.has(key)) {
      financeByMonth.get(key)[row._id.type] = row.amount;
    }
  }

  return {
    totals: {
      totalGoals,
      completedGoals,
      openTodos,
      todayTodos,
      notesCount,
      activeHabits: habits.length,
      currentBalance: financeMap.income - financeMap.expense,
      monthlyIncome: financeMap.income,
      monthlyExpense: financeMap.expense,
    },
    productivitySeries: Array.from(activityMap.values()).reverse(),
    financeSeries: Array.from(financeByMonth.values()),
    goalBreakdown: goalBreakdown.map((row) => ({
      name: row._id.replace("_", " "),
      value: row.value,
    })),
    topHabits: habits.map((habit) => ({
      id: habit._id,
      name: habit.name,
      streak: habit.streak,
      bestStreak: habit.bestStreak,
      frequency: habit.frequency,
    })),
    upcomingGoals,
    recentNotes,
    recentLogs: latestLogs,
  };
};
