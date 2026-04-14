import { Router } from "express";
import { dailyLogController } from "../controllers/dailyLogController.js";

const router = Router();

router.get("/", dailyLogController.list);
router.post("/", dailyLogController.create);
router.get("/:id", dailyLogController.getOne);
router.patch("/:id", dailyLogController.update);
router.delete("/:id", dailyLogController.remove);

export default router;
