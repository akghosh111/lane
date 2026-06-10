import { boardService } from "./service.js";
import { createBoardSchema, updateBoardSchema } from "./model.js";

export const boardController = {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const validated = createBoardSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const newBoard = await boardService.createBoard(userId, validated.data);
      return res.status(201).json(newBoard);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_WORKSPACE_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to workspace" });
      }
      console.error("Create board error:", error);
      return res.status(500).json({ error: "Failed to create board" });
    }
  },

  async listByWorkspace(req, res) {
    try {
      const userId = req.user.id;
      const { id: workspaceId } = req.params;

      const boards = await boardService.getBoardsByWorkspace(workspaceId, userId);
      return res.json(boards);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_WORKSPACE_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to workspace" });
      }
      console.error("List boards error:", error);
      return res.status(500).json({ error: "Failed to fetch boards" });
    }
  },

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const validated = updateBoardSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const updated = await boardService.updateBoard(id, userId, validated.data);
      if (!updated) {
        return res.status(404).json({ error: "Board not found or unauthorized" });
      }

      return res.json(updated);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_BOARD_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to board" });
      }
      console.error("Update board error:", error);
      return res.status(500).json({ error: "Failed to update board" });
    }
  },

  async remove(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const deleted = await boardService.deleteBoard(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Board not found or unauthorized" });
      }

      return res.json({ message: "Board deleted successfully" });
    } catch (error) {
      if (error.message === "UNAUTHORIZED_BOARD_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to board" });
      }
      console.error("Delete board error:", error);
      return res.status(500).json({ error: "Failed to delete board" });
    }
  },
};
