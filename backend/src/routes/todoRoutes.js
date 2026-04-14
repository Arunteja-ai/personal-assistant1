import { Router } from "express";
import { todoController } from "../controllers/todoController.js";

const router = Router();

router.get("/", todoController.list);
router.post("/", todoController.create);
router.get("/:id", todoController.getOne);
router.patch("/:id", todoController.update);
router.delete("/:id", todoController.remove);

export default router;
