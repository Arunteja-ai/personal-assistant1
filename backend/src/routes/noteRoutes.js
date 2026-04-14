import { Router } from "express";
import { noteController } from "../controllers/noteController.js";

const router = Router();

router.get("/", noteController.list);
router.post("/", noteController.create);
router.get("/:id", noteController.getOne);
router.patch("/:id", noteController.update);
router.delete("/:id", noteController.remove);

export default router;
