import { asyncHandler } from "../utils/asyncHandler.js";
import { getUserDashboardSummary } from "../services/dashboardService.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await getUserDashboardSummary(req.user._id);
  res.json({ data });
});
