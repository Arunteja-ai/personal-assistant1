import { AdminLog } from "../models/AdminLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  buildSearchQuery,
  parsePagination,
  parseSort,
  pickAllowedFilters,
  sendPaginatedResponse,
} from "../utils/query.js";

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort, ["createdAt", "action", "targetType"], "-createdAt");
  const query = {
    ...buildSearchQuery(req.query.search, ["actorEmail", "action", "targetType", "targetLabel"]),
    ...pickAllowedFilters(req.query, ["action", "targetType"]),
  };

  const [data, total] = await Promise.all([
    AdminLog.find(query).sort(sort).skip(skip).limit(limit),
    AdminLog.countDocuments(query),
  ]);

  sendPaginatedResponse({ res, data, total, page, limit });
});
