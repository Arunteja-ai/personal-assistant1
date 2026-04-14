import { asyncHandler } from "../utils/asyncHandler.js";
import { getAdminDashboardSummary } from "../services/analyticsService.js";

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const data = await getAdminDashboardSummary();
  res.json({ data });
});
