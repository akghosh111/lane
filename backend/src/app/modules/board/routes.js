import { Router } from "express";
import { boardController } from "./controller.js";
import { isAuthenticated } from "../../../middleware/auth.js";

const router = Router();

router.use(isAuthenticated);

router.post("/", boardController.create);
router.patch("/:id", boardController.update);
router.delete("/:id", boardController.remove);

export { router as boardRouter };
