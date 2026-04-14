import { Router } from "express";
import { goalController } from "../controllers/goalController.js";

const router = Router();

router.get("/", goalController.list);
router.post("/", goalController.create);
router.get("/:id", goalController.getOne);
router.patch("/:id", goalController.update);
router.delete("/:id", goalController.remove);

export default router;
