import { listService } from "./service.js";
import { createListSchema, updateListSchema, reorderListsSchema } from "./model.js";

export const listController = {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const validated = createListSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const newList = await listService.createList(userId, validated.data);
      return res.status(201).json(newList);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_BOARD_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to board" });
      }
      console.error("Create list error:", error);
      return res.status(500).json({ error: "Failed to create list" });
    }
  },

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const validated = updateListSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const updated = await listService.updateList(id, userId, validated.data);
      if (!updated) {
        return res.status(404).json({ error: "List not found or unauthorized" });
      }

      return res.json(updated);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_BOARD_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to board" });
      }
      console.error("Update list error:", error);
      return res.status(500).json({ error: "Failed to update list" });
    }
  },

  async remove(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const deleted = await listService.deleteList(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "List not found or unauthorized" });
      }

      return res.json({ message: "List deleted successfully" });
    } catch (error) {
      if (error.message === "UNAUTHORIZED_BOARD_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to board" });
      }
      console.error("Delete list error:", error);
      return res.status(500).json({ error: "Failed to delete list" });
    }
  },

  async reorder(req, res) {
    try {
      const userId = req.user.id;
      const validated = reorderListsSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const updatedLists = await listService.reorderLists(userId, validated.data);
      return res.json(updatedLists);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_BOARD_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to board" });
      }
      console.error("Reorder lists error:", error);
      return res.status(500).json({ error: "Failed to reorder lists" });
    }
  },
};
