import { db } from "../../../db/index.js";
import { boardList, board, workspaceMember } from "../../../db/schema.js";
import { eq, and, inArray } from "drizzle-orm";

export const listService = {
  async verifyBoardAccess(boardId, userId) {
    const [result] = await db
      .select({ workspaceId: board.workspaceId })
      .from(board)
      .where(eq(board.id, boardId));

    if (!result) return false;

    const [membership] = await db
      .select()
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, result.workspaceId),
          eq(workspaceMember.userId, userId)
        )
      );

    return !!membership;
  },

  async createList(userId, { boardId, name, position }) {
    const hasAccess = await this.verifyBoardAccess(boardId, userId);
    if (!hasAccess) {
      throw new Error("UNAUTHORIZED_BOARD_ACCESS");
    }

    const [newList] = await db
      .insert(boardList)
      .values({
        id: crypto.randomUUID(),
        boardId,
        name,
        position,
      })
      .returning();

    return newList;
  },

  async updateList(listId, userId, data) {
    
    const [listRecord] = await db
      .select({ boardId: boardList.boardId })
      .from(boardList)
      .where(eq(boardList.id, listId));

    if (!listRecord) return null;

    
    const hasAccess = await this.verifyBoardAccess(listRecord.boardId, userId);
    if (!hasAccess) {
      throw new Error("UNAUTHORIZED_BOARD_ACCESS");
    }

    
    const [updated] = await db
      .update(boardList)
      .set(data)
      .where(eq(boardList.id, listId))
      .returning();

    return updated;
  },

  async deleteList(listId, userId) {
    const [listRecord] = await db
      .select({ boardId: boardList.boardId })
      .from(boardList)
      .where(eq(boardList.id, listId));

    if (!listRecord) return null;

    const hasAccess = await this.verifyBoardAccess(listRecord.boardId, userId);
    if (!hasAccess) {
      throw new Error("UNAUTHORIZED_BOARD_ACCESS");
    }

    const [deleted] = await db
      .delete(boardList)
      .where(eq(boardList.id, listId))
      .returning();

    return deleted;
  },

  async reorderLists(userId, { boardId, lists }) {
    const hasAccess = await this.verifyBoardAccess(boardId, userId);
    if (!hasAccess) {
      throw new Error("UNAUTHORIZED_BOARD_ACCESS");
    }

    return await db.transaction(async (tx) => {
      const results = [];
      for (const item of lists) {
        const [updated] = await tx
          .update(boardList)
          .set({ position: item.position })
          .where(
            and(
              eq(boardList.id, item.id),
              eq(boardList.boardId, boardId)
            )
          )
          .returning();
        results.push(updated);
      }
      return results;
    });
  },
};
