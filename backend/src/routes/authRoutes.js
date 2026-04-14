import { Router } from "express";
import {
  login,
  logout,
  logoutAll,
  me,
  refresh,
  register,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/logout-all", protect, logoutAll);
router.get("/me", protect, me);

export default router;
