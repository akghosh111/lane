import { db } from "../../../db/index.js";
import { workspace, workspaceMember } from "../../../db/schema.js";
import { eq, and } from "drizzle-orm";

export const workspaceService = {
  async createWorkspace(userId, { name }) {
    const workspaceId = crypto.randomUUID();

    return await db.transaction(async (tx) => {
      
      const [newWorkspace] = await tx.insert(workspace).values({
        id: workspaceId,
        name,
        ownerId: userId,
      }).returning();

      
      await tx.insert(workspaceMember).values({
        id: crypto.randomUUID(),
        workspaceId,
        userId,
        role: "owner",
      });

      return newWorkspace;
    });
  },

  async getUserWorkspaces(userId) {
    
    const results = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.ownerId,
        createdAt: workspace.createdAt,
      })
      .from(workspace)
      .innerJoin(workspaceMember, eq(workspace.id, workspaceMember.workspaceId))
      .where(eq(workspaceMember.userId, userId));

    return results;
  },

  async getWorkspaceById(workspaceId, userId) {
    
    const [result] = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.ownerId,
      })
      .from(workspace)
      .innerJoin(workspaceMember, eq(workspace.id, workspaceMember.workspaceId))
      .where(
        and(
          eq(workspace.id, workspaceId),
          eq(workspaceMember.userId, userId)
        )
      );

    return result;
  },

  async updateWorkspace(workspaceId, userId, { name }) {
    
    const [updated] = await db
      .update(workspace)
      .set({ name, updatedAt: new Date() })
      .where(
        and(
          eq(workspace.id, workspaceId),
          eq(workspace.ownerId, userId)
        )
      )
      .returning();

    return updated;
  },

  async deleteWorkspace(workspaceId, userId) {
    
    const [deleted] = await db
      .delete(workspace)
      .where(
        and(
          eq(workspace.id, workspaceId),
          eq(workspace.ownerId, userId)
        )
      )
      .returning();

    return deleted;
  },
};
