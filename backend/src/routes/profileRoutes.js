import { Router } from "express";
import {
  getProfile,
  listSessions,
  updatePassword,
  updateProfile,
} from "../controllers/profileController.js";

const router = Router();

router.get("/", getProfile);
router.patch("/", updateProfile);
router.patch("/password", updatePassword);
router.get("/sessions", listSessions);

export default router;
