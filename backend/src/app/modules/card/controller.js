import { cardService } from "./service.js";
import { createCardSchema, updateCardSchema } from "./model.js";

export const cardController = {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const validated = createCardSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const newCard = await cardService.createCard(userId, validated.data);
      return res.status(201).json(newCard);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_LIST_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to list" });
      }
      console.error("Create card error:", error);
      return res.status(500).json({ error: "Failed to create card" });
    }
  },

  async listByBoard(req, res) {
    try {
      const userId = req.user.id;
      const { id: boardId } = req.params;

      const cards = await cardService.getCardsByBoard(boardId, userId);
      return res.json(cards);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_BOARD_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to board" });
      }
      console.error("List cards error:", error);
      return res.status(500).json({ error: "Failed to fetch cards" });
    }
  },

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const validated = updateCardSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const updated = await cardService.updateCard(id, userId, validated.data);
      if (!updated) {
        return res.status(404).json({ error: "Card not found or unauthorized" });
      }

      return res.json(updated);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_BOARD_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to board" });
      }
      console.error("Update card error:", error);
      return res.status(500).json({ error: "Failed to update card" });
    }
  },

  async remove(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const deleted = await cardService.deleteCard(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Card not found or unauthorized" });
      }

      return res.json({ message: "Card deleted successfully" });
    } catch (error) {
      if (error.message === "UNAUTHORIZED_BOARD_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to board" });
      }
      console.error("Delete card error:", error);
      return res.status(500).json({ error: "Failed to delete card" });
    }
  },

  async archive(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const archived = await cardService.archiveCard(id, userId);
      if (!archived) {
        return res.status(404).json({ error: "Card not found or unauthorized" });
      }

      return res.json(archived);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_BOARD_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to board" });
      }
      console.error("Archive card error:", error);
      return res.status(500).json({ error: "Failed to archive card" });
    }
  },

  async move(req, res) {
    try {
      const userId = req.user.id;
      const validated = moveCardSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const movedCard = await cardService.moveCard(userId, validated.data);
      return res.json(movedCard);
    } catch (error) {
      if (error.message === "UNAUTHORIZED_LIST_ACCESS") {
        return res.status(403).json({ error: "Unauthorized access to lists" });
      }
      if (error.message === "CARD_NOT_FOUND") {
        return res.status(404).json({ error: "Card not found in the specified source list" });
      }
      console.error("Move card error:", error);
      return res.status(500).json({ error: "Failed to move card" });
    }
  },
};
