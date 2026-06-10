import { Router } from "express";
import { boardController } from "./controller.js";
import { cardController } from "../card/controller.js";
import { isAuthenticated } from "../../../middleware/auth.js";

const router = Router();

router.use(isAuthenticated);

router.post("/", boardController.create);
router.patch("/:id", boardController.update);
router.delete("/:id", boardController.remove);

// Card routes within board context
router.get("/:id/cards", cardController.listByBoard);

export { router as boardRouter };
