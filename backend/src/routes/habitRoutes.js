import { Router } from "express";
import { checkInHabit, habitController } from "../controllers/habitController.js";

const router = Router();

router.get("/", habitController.list);
router.post("/", habitController.create);
router.get("/:id", habitController.getOne);
router.patch("/:id", habitController.update);
router.delete("/:id", habitController.remove);
router.post("/:id/check-in", checkInHabit);

export default router;
