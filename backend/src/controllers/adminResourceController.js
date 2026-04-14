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
  parseDateRange,
  parsePagination,
  parseSort,
  pickAllowedFilters,
  sendPaginatedResponse,
} from "../utils/query.js";
import { recordAdminAction } from "../services/adminLogService.js";

const registry = {
  goals: {
    Model: Goal,
    labelField: "title",
    searchFields: ["title", "description", "category"],
    filterFields: ["status", "priority", "flagged", "userId"],
    sortFields: ["createdAt", "updatedAt", "progress", "targetDate"],
    dateField: "createdAt",
  },
  todos: {
    Model: Todo,
    labelField: "title",
    searchFields: ["title", "description", "tags"],
    filterFields: ["status", "priority", "flagged", "userId"],
    sortFields: ["createdAt", "updatedAt", "dueDate", "priority"],
    dateField: "createdAt",
  },
  transactions: {
    Model: Transaction,
    labelField: "title",
    searchFields: ["title", "category", "note", "paymentMethod"],
    filterFields: ["type", "category", "flagged", "userId"],
    sortFields: ["createdAt", "updatedAt", "date", "amount"],
    dateField: "date",
  },
  notes: {
    Model: Note,
    labelField: "title",
    searchFields: ["title", "content", "tags"],
    filterFields: ["mood", "isPinned", "flagged", "userId"],
    sortFields: ["createdAt", "updatedAt", "lastEditedAt"],
    dateField: "updatedAt",
  },
  habits: {
    Model: Habit,
    labelField: "name",
    searchFields: ["name", "description"],
    filterFields: ["frequency", "archived", "flagged", "userId"],
    sortFields: ["createdAt", "updatedAt", "streak", "bestStreak"],
    dateField: "createdAt",
  },
  "daily-logs": {
    Model: DailyLog,
    labelField: "date",
    searchFields: ["wins", "blockers", "gratitude"],
    filterFields: ["mood", "flagged", "userId"],
    sortFields: ["createdAt", "updatedAt", "date", "energy", "focus"],
    dateField: "date",
  },
};

const resolveResource = (resource) => {
  const config = registry[resource];
  if (!config) {
    throw new ApiError(404, "Unknown resource type.");
  }
  return config;
};

export const listResources = asyncHandler(async (req, res) => {
  const config = resolveResource(req.params.resource);
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort, config.sortFields, "-createdAt");
  const query = {
    ...buildSearchQuery(req.query.search, config.searchFields),
    ...pickAllowedFilters(req.query, config.filterFields),
    ...parseDateRange(req.query, config.dateField),
  };

  const [data, total] = await Promise.all([
    config.Model.find(query)
      .populate("userId", "name email role status")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    config.Model.countDocuments(query),
  ]);

  sendPaginatedResponse({ res, data, total, page, limit });
});

export const updateResource = asyncHandler(async (req, res) => {
  const config = resolveResource(req.params.resource);
  const item = await config.Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email");

  if (!item) {
    throw new ApiError(404, "Resource not found.");
  }

  await recordAdminAction({
    actor: req.user,
    action: "edit_resource",
    targetType: req.params.resource,
    targetId: item._id,
    targetLabel: item[config.labelField]?.toString() || req.params.id,
    metadata: { changes: Object.keys(req.body) },
  });

  res.json({
    message: "Resource updated successfully.",
    data: item,
  });
});

export const deleteResource = asyncHandler(async (req, res) => {
  const config = resolveResource(req.params.resource);
  const item = await config.Model.findByIdAndDelete(req.params.id);

  if (!item) {
    throw new ApiError(404, "Resource not found.");
  }

  await recordAdminAction({
    actor: req.user,
    action: "delete_resource",
    targetType: req.params.resource,
    targetId: item._id,
    targetLabel: item[config.labelField]?.toString() || req.params.id,
  });

  res.json({
    message: "Resource deleted successfully.",
  });
});

export const flagResource = asyncHandler(async (req, res) => {
  const config = resolveResource(req.params.resource);
  const { flagged, reason } = req.body;
  const item = await config.Model.findById(req.params.id);

  if (!item) {
    throw new ApiError(404, "Resource not found.");
  }

  item.flagged = Boolean(flagged);
  item.flagReason = flagged ? reason || "Flagged by administrator." : "";
  item.flaggedBy = flagged ? req.user._id : null;
  await item.save();

  await recordAdminAction({
    actor: req.user,
    action: item.flagged ? "flag_resource" : "unflag_resource",
    targetType: req.params.resource,
    targetId: item._id,
    targetLabel: item[config.labelField]?.toString() || req.params.id,
    metadata: { reason: item.flagReason },
  });

  res.json({
    message: "Resource flag updated successfully.",
    data: item,
  });
});
