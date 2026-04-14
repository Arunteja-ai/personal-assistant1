import { User } from "../models/User.js";
import { Goal } from "../models/Goal.js";
import { Todo } from "../models/Todo.js";
import { Transaction } from "../models/Transaction.js";
import { Note } from "../models/Note.js";
import { Habit } from "../models/Habit.js";
import { DailyLog } from "../models/DailyLog.js";
import { LoginHistory } from "../models/LoginHistory.js";
import { formatDayLabel, formatMonthLabel } from "../utils/date.js";

const mergeUserActivity = (scoreMap, rows, metric) => {
  for (const row of rows) {
    const key = String(row._id);
    if (!scoreMap.has(key)) {
      scoreMap.set(key, { userId: key, score: 0 });
    }

    scoreMap.get(key).score += row[metric];
  }
};

export const getAdminDashboardSummary = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalUsers,
    activeUsers,
    totalTransactions,
    totalGoals,
    userGrowthRows,
    activityRows,
    featureUsage,
    suspiciousLogins,
    transactionTrendRows,
    goalActivity,
    todoActivity,
    transactionActivity,
    habitActivity,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastLoginAt: { $gte: sevenDaysAgo } }),
    Transaction.countDocuments(),
    Goal.countDocuments(),
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          users: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    LoginHistory.aggregate([
      { $match: { occurredAt: { $gte: thirtyDaysAgo }, status: "success" } },
      {
        $group: {
          _id: {
            year: { $year: "$occurredAt" },
            month: { $month: "$occurredAt" },
            day: { $dayOfMonth: "$occurredAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),
    Promise.all([
      Goal.countDocuments(),
      Todo.countDocuments(),
      Transaction.countDocuments(),
      Note.countDocuments(),
      Habit.countDocuments(),
      DailyLog.countDocuments(),
    ]),
    LoginHistory.countDocuments({
      detectedSignals: { $exists: true, $ne: [] },
      occurredAt: { $gte: thirtyDaysAgo },
    }),
    Transaction.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
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
    Goal.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
    Todo.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
    Transaction.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
    Habit.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]),
  ]);

  const [goalsCount, todosCount, transactionsCount, notesCount, habitsCount, dailyLogsCount] =
    featureUsage;

  const userGrowthMap = new Map();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    userGrowthMap.set(key, { month: formatMonthLabel(date), users: 0 });
  }

  for (const row of userGrowthRows) {
    const key = `${row._id.year}-${row._id.month}`;
    if (userGrowthMap.has(key)) {
      userGrowthMap.get(key).users = row.users;
    }
  }

  const activityMap = new Map();
  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    activityMap.set(key, { date: formatDayLabel(date), logins: 0 });
  }

  for (const row of activityRows) {
    const key = `${row._id.year}-${row._id.month}-${row._id.day}`;
    if (activityMap.has(key)) {
      activityMap.get(key).logins = row.count;
    }
  }

  const transactionMap = new Map();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    transactionMap.set(key, { month: formatMonthLabel(date), income: 0, expense: 0 });
  }

  for (const row of transactionTrendRows) {
    const key = `${row._id.year}-${row._id.month}`;
    if (transactionMap.has(key)) {
      transactionMap.get(key)[row._id.type] = row.amount;
    }
  }

  const scoreMap = new Map();
  mergeUserActivity(scoreMap, goalActivity, "count");
  mergeUserActivity(scoreMap, todoActivity, "count");
  mergeUserActivity(scoreMap, transactionActivity, "count");
  mergeUserActivity(scoreMap, habitActivity, "count");

  const users = await User.find({
    _id: { $in: Array.from(scoreMap.keys()) },
  }).select("name email role status");
  const directory = new Map(users.map((user) => [String(user._id), user]));

  const mostActiveUsers = Array.from(scoreMap.values())
    .map((entry) => ({ ...entry, user: directory.get(entry.userId) }))
    .filter((entry) => entry.user)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((entry) => ({
      userId: entry.userId,
      name: entry.user.name,
      email: entry.user.email,
      score: entry.score,
      role: entry.user.role,
      status: entry.user.status,
    }));

  return {
    totals: {
      totalUsers,
      activeUsers,
      totalTransactions,
      totalGoals,
      suspiciousLogins,
    },
    userGrowth: Array.from(userGrowthMap.values()),
    activityTrends: Array.from(activityMap.values()),
    transactionTrends: Array.from(transactionMap.values()),
    featureUsage: [
      { name: "Goals", value: goalsCount },
      { name: "Todos", value: todosCount },
      { name: "Transactions", value: transactionsCount },
      { name: "Notes", value: notesCount },
      { name: "Habits", value: habitsCount },
      { name: "Daily Logs", value: dailyLogsCount },
    ],
    mostActiveUsers,
  };
};
