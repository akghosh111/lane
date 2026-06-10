import { Router } from "express";
import { listController } from "./controller.js";
import { isAuthenticated } from "../../../middleware/auth.js";

const router = Router();

router.use(isAuthenticated);

router.post("/", listController.create);
router.patch("/reorder", listController.reorder);
router.patch("/:id", listController.update);
router.delete("/:id", listController.remove);

export { router as listRouter };
