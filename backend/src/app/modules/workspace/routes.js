import { Router } from "express";
import { workspaceController } from "./controller.js";
import { boardController } from "../board/controller.js";
import { isAuthenticated } from "../../../middleware/auth.js";

const router = Router();

// All workspace routes require authentication
router.use(isAuthenticated);

router.post("/", workspaceController.create);
router.get("/", workspaceController.list);
router.get("/:id", workspaceController.getById);
router.patch("/:id", workspaceController.update);
router.delete("/:id", workspaceController.remove);

// Board routes within workspace context
router.get("/:id/boards", boardController.listByWorkspace);

export { router as workspaceRouter };

