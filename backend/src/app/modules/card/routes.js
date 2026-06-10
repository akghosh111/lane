import { Router } from "express";
import { cardController } from "./controller.js";
import { isAuthenticated } from "../../../middleware/auth.js";

const router = Router();

router.use(isAuthenticated);

router.post("/", cardController.create);
router.patch("/move", cardController.move);
router.patch("/:id", cardController.update);
router.delete("/:id", cardController.remove);
router.patch("/:id/archive", cardController.archive);

export { router as cardRouter };
