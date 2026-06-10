import { Router } from "express";
import { workspaceController } from "./controller.js";
import { isAuthenticated } from "../../../middleware/auth.js";

const router = Router();


router.use(isAuthenticated);

router.post("/", workspaceController.create);
router.get("/", workspaceController.list);
router.get("/:id", workspaceController.getById);
router.patch("/:id", workspaceController.update);
router.delete("/:id", workspaceController.remove);

export { router as workspaceRouter };
