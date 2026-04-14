import { Router } from "express";
import { getAdminDashboard } from "../controllers/adminDashboardController.js";
import {
  deleteUser,
  getUserDetails,
  listUsers,
  updateUserRole,
  updateUserStatus,
} from "../controllers/adminUserController.js";
import {
  deleteResource,
  flagResource,
  listResources,
  updateResource,
} from "../controllers/adminResourceController.js";
import {
  getLoginHistory,
  getSuspiciousLogins,
  listSessions,
  revokeSession,
} from "../controllers/adminSecurityController.js";
import { listAuditLogs } from "../controllers/adminAuditController.js";

const router = Router();

router.get("/dashboard", getAdminDashboard);

router.get("/users", listUsers);
router.get("/users/:id", getUserDetails);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

router.get("/resources/:resource", listResources);
router.patch("/resources/:resource/:id", updateResource);
router.delete("/resources/:resource/:id", deleteResource);
router.patch("/resources/:resource/:id/flag", flagResource);

router.get("/security/login-history", getLoginHistory);
router.get("/security/suspicious-logins", getSuspiciousLogins);
router.get("/security/sessions", listSessions);
router.delete("/security/sessions/:id", revokeSession);

router.get("/audit-logs", listAuditLogs);

export default router;
