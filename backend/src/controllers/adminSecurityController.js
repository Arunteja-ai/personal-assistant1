import { LoginHistory } from "../models/LoginHistory.js";
import { RefreshToken } from "../models/RefreshToken.js";
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
import { revokeRefreshTokenById } from "../services/tokenService.js";

export const getLoginHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort, ["occurredAt", "status", "email"], "-occurredAt");
  const query = {
    ...buildSearchQuery(req.query.search, ["email", "ipAddress", "userAgent"]),
    ...pickAllowedFilters(req.query, ["status"]),
  };

  const [data, total] = await Promise.all([
    LoginHistory.find(query)
      .populate("userId", "name email role status")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    LoginHistory.countDocuments(query),
  ]);

  sendPaginatedResponse({ res, data, total, page, limit });
});

export const getSuspiciousLogins = asyncHandler(async (_req, res) => {
  const data = await LoginHistory.find({
    detectedSignals: { $exists: true, $ne: [] },
  })
    .populate("userId", "name email role status")
    .sort("-occurredAt")
    .limit(50);

  res.json({ data });
});

export const listSessions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort, ["createdAt", "expiresAt"], "-createdAt");
  const query = {
    revokedAt: null,
    expiresAt: { $gt: new Date() },
    ...pickAllowedFilters(req.query, ["userId"]),
  };

  const [data, total] = await Promise.all([
    RefreshToken.find(query)
      .populate("userId", "name email role status")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    RefreshToken.countDocuments(query),
  ]);

  sendPaginatedResponse({ res, data, total, page, limit });
});

export const revokeSession = asyncHandler(async (req, res) => {
  const session = await RefreshToken.findById(req.params.id).populate("userId", "name email");

  if (!session) {
    throw new ApiError(404, "Session not found.");
  }

  await revokeRefreshTokenById(session._id);

  await recordAdminAction({
    actor: req.user,
    action: "revoke_session",
    targetType: "session",
    targetId: session._id,
    targetLabel: session.userId?.email || req.params.id,
  });

  res.json({
    message: "Session revoked successfully.",
  });
});
