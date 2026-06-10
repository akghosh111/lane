import { db } from "../../../db/index.js";
import { board, boardList, workspaceMember } from "../../../db/schema.js";
import { eq, and } from "drizzle-orm";

export const boardService = {
  async createBoard(userId, { workspaceId, name }) {
    
    const [membership] = await db
      .select()
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId)
        )
      );

    if (!membership) {
      throw new Error("UNAUTHORIZED_WORKSPACE_ACCESS");
    }

    const boardId = crypto.randomUUID();

    return await db.transaction(async (tx) => {
      
      const [newBoard] = await tx
        .insert(board)
        .values({
          id: boardId,
          workspaceId,
          name,
          createdBy: userId,
        })
        .returning();

      
      const defaultLists = ["Todo", "In Progress", "Done"];
      for (const [index, listName] of defaultLists.entries()) {
        await tx.insert(boardList).values({
          id: crypto.randomUUID(),
          boardId: boardId,
          name: listName,
          position: index,
        });
      }

      return newBoard;
    });
  },

  async getBoardsByWorkspace(workspaceId, userId) {
    
    const [membership] = await db
      .select()
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId)
        )
      );

    if (!membership) {
      throw new Error("UNAUTHORIZED_WORKSPACE_ACCESS");
    }

    return await db
      .select()
      .from(board)
      .where(eq(board.workspaceId, workspaceId));
  },

  async updateBoard(boardId, userId, { name }) {
    
    const [result] = await db
      .select({ workspaceId: board.workspaceId })
      .from(board)
      .where(eq(board.id, boardId));

    if (!result) return null;

    const [membership] = await db
      .select()
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, result.workspaceId),
          eq(workspaceMember.userId, userId)
        )
      );

    if (!membership) {
      throw new Error("UNAUTHORIZED_BOARD_ACCESS");
    }

    const [updated] = await db
      .update(board)
      .set({ name, updatedAt: new Date() })
      .where(eq(board.id, boardId))
      .returning();

    return updated;
  },

  async deleteBoard(boardId, userId) {
    
    const [result] = await db
      .select({ workspaceId: board.workspaceId })
      .from(board)
      .where(eq(board.id, boardId));

    if (!result) return null;

    const [membership] = await db
      .select()
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, result.workspaceId),
          eq(workspaceMember.userId, userId)
        )
      );

    if (!membership) {
      throw new Error("UNAUTHORIZED_BOARD_ACCESS");
    }

    const [deleted] = await db
      .delete(board)
      .where(eq(board.id, boardId))
      .returning();

    return deleted;
  },
};
