import { workspaceService } from "./service.js";
import { createWorkspaceSchema, updateWorkspaceSchema } from "./model.js";

export const workspaceController = {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const validated = createWorkspaceSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const newWorkspace = await workspaceService.createWorkspace(userId, validated.data);
      return res.status(201).json(newWorkspace);
    } catch (error) {
      console.error("Create workspace error:", error);
      return res.status(500).json({ error: "Failed to create workspace" });
    }
  },

  async list(req, res) {
    try {
      const userId = req.user.id;
      const workspaces = await workspaceService.getUserWorkspaces(userId);
      return res.json(workspaces);
    } catch (error) {
      console.error("List workspaces error:", error);
      return res.status(500).json({ error: "Failed to fetch workspaces" });
    }
  },

  async getById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const workspace = await workspaceService.getWorkspaceById(id, userId);
      if (!workspace) {
        return res.status(404).json({ error: "Workspace not found or unauthorized" });
      }

      return res.json(workspace);
    } catch (error) {
      console.error("Get workspace error:", error);
      return res.status(500).json({ error: "Failed to fetch workspace" });
    }
  },

  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const validated = updateWorkspaceSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const updated = await workspaceService.updateWorkspace(id, userId, validated.data);
      if (!updated) {
        return res.status(404).json({ error: "Workspace not found or unauthorized to update" });
      }

      return res.json(updated);
    } catch (error) {
      console.error("Update workspace error:", error);
      return res.status(500).json({ error: "Failed to update workspace" });
    }
  },

  async remove(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const deleted = await workspaceService.deleteWorkspace(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Workspace not found or unauthorized to delete" });
      }

      return res.json({ message: "Workspace deleted successfully" });
    } catch (error) {
      console.error("Delete workspace error:", error);
      return res.status(500).json({ error: "Failed to delete workspace" });
    }
  },
};
