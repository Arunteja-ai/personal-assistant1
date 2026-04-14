import { User } from "../models/User.js";
import { Goal } from "../models/Goal.js";
import { Todo } from "../models/Todo.js";
import { Transaction } from "../models/Transaction.js";
import { Note } from "../models/Note.js";
import { Habit } from "../models/Habit.js";
import { DailyLog } from "../models/DailyLog.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  buildSearchQuery,
  parsePagination,
  parseSort,
  pickAllowedFilters,
  sendPaginatedResponse,
} from "../utils/query.js";
import { recordAdminAction } from "../services/adminLogService.js";
import { revokeAllRefreshTokens } from "../services/tokenService.js";
import { ROLES, USER_STATUS } from "../constants/roles.js";

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(
    req.query.sort,
    ["createdAt", "updatedAt", "name", "lastLoginAt"],
    "-createdAt",
  );
  const query = {
    ...buildSearchQuery(req.query.search, ["name", "email", "title"]),
    ...pickAllowedFilters(req.query, ["role", "status"]),
  };

  const [data, total] = await Promise.all([
    User.find(query).select("-password").sort(sort).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  sendPaginatedResponse({ res, data, total, page, limit });
});

export const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const [goals, todos, transactions, notes, habits, dailyLogs] = await Promise.all([
    Goal.find({ userId: user._id }).sort("-createdAt").limit(5),
    Todo.find({ userId: user._id }).sort("-createdAt").limit(5),
    Transaction.find({ userId: user._id }).sort("-date").limit(5),
    Note.find({ userId: user._id }).sort("-updatedAt").limit(5),
    Habit.find({ userId: user._id }).sort("-updatedAt").limit(5),
    DailyLog.find({ userId: user._id }).sort("-date").limit(5),
  ]);

  const [goalCount, todoCount, transactionCount, noteCount, habitCount, logCount] =
    await Promise.all([
      Goal.countDocuments({ userId: user._id }),
      Todo.countDocuments({ userId: user._id }),
      Transaction.countDocuments({ userId: user._id }),
      Note.countDocuments({ userId: user._id }),
      Habit.countDocuments({ userId: user._id }),
      DailyLog.countDocuments({ userId: user._id }),
    ]);

  res.json({
    data: {
      user,
      counts: {
        goals: goalCount,
        todos: todoCount,
        transactions: transactionCount,
        notes: noteCount,
        habits: habitCount,
        dailyLogs: logCount,
      },
      recentActivity: {
        goals,
        todos,
        transactions,
        notes,
        habits,
        dailyLogs,
      },
    },
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!Object.values(USER_STATUS).includes(status)) {
    throw new ApiError(400, "Invalid status supplied.");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.status = status;
  await user.save();

  if (status === USER_STATUS.BLOCKED) {
    await revokeAllRefreshTokens(user._id);
  }

  await recordAdminAction({
    actor: req.user,
    action: status === USER_STATUS.BLOCKED ? "block_user" : "unblock_user",
    targetType: "user",
    targetId: user._id,
    targetLabel: `${user.name} <${user.email}>`,
    metadata: { status },
  });

  res.json({
    message: "User status updated successfully.",
    data: user,
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!Object.values(ROLES).includes(role)) {
    throw new ApiError(400, "Invalid role supplied.");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.role = role;
  await user.save();

  await recordAdminAction({
    actor: req.user,
    action: role === ROLES.ADMIN ? "promote_user" : "demote_user",
    targetType: "user",
    targetId: user._id,
    targetLabel: `${user.name} <${user.email}>`,
    metadata: { role },
  });

  res.json({
    message: "User role updated successfully.",
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  await Promise.all([
    Goal.deleteMany({ userId: user._id }),
    Todo.deleteMany({ userId: user._id }),
    Transaction.deleteMany({ userId: user._id }),
    Note.deleteMany({ userId: user._id }),
    Habit.deleteMany({ userId: user._id }),
    DailyLog.deleteMany({ userId: user._id }),
    revokeAllRefreshTokens(user._id),
    User.findByIdAndDelete(user._id),
  ]);

  await recordAdminAction({
    actor: req.user,
    action: "delete_user",
    targetType: "user",
    targetId: user._id,
    targetLabel: `${user.name} <${user.email}>`,
  });

  res.json({
    message: "User and linked data deleted successfully.",
  });
});
