import { Router } from "express";
import { transactionController } from "../controllers/transactionController.js";

const router = Router();

router.get("/", transactionController.list);
router.post("/", transactionController.create);
router.get("/:id", transactionController.getOne);
router.patch("/:id", transactionController.update);
router.delete("/:id", transactionController.remove);

export default router;
