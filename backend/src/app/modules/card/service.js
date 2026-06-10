import { db } from "../../../db/index.js";
import { card, boardList, board, workspaceMember } from "../../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

export const cardService = {
  async verifyListAccess(listId, userId) {
    const [result] = await db
      .select({ workspaceId: board.workspaceId, boardId: boardList.boardId })
      .from(boardList)
      .innerJoin(board, eq(boardList.boardId, board.id))
      .where(eq(boardList.id, listId));

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

    return membership ? result : null;
  },

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

  async createCard(userId, { listId, title }) {
    const access = await this.verifyListAccess(listId, userId);
    if (!access) {
      throw new Error("UNAUTHORIZED_LIST_ACCESS");
    }

    // Get max position in list
    const [maxPos] = await db
      .select({ count: sql`count(*)` })
      .from(card)
      .where(eq(card.listId, listId));
    
    const position = parseInt(maxPos?.count || 0);

    const [newCard] = await db
      .insert(card)
      .values({
        id: crypto.randomUUID(),
        boardId: access.boardId,
        listId,
        title,
        position,
        createdBy: userId,
      })
      .returning();

    return newCard;
  },

  async getCardsByBoard(boardId, userId) {
    const hasAccess = await this.verifyBoardAccess(boardId, userId);
    if (!hasAccess) {
      throw new Error("UNAUTHORIZED_BOARD_ACCESS");
    }

    return await db
      .select()
      .from(card)
      .where(eq(card.boardId, boardId))
      .orderBy(card.position);
  },

  async updateCard(cardId, userId, data) {
    const [cardRecord] = await db
      .select({ boardId: card.boardId })
      .from(card)
      .where(eq(card.id, cardId));

    if (!cardRecord) return null;

    const hasAccess = await this.verifyBoardAccess(cardRecord.boardId, userId);
    if (!hasAccess) {
      throw new Error("UNAUTHORIZED_BOARD_ACCESS");
    }

    const [updated] = await db
      .update(card)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(card.id, cardId))
      .returning();

    return updated;
  },

  async deleteCard(cardId, userId) {
    const [cardRecord] = await db
      .select({ boardId: card.boardId })
      .from(card)
      .where(eq(card.id, cardId));

    if (!cardRecord) return null;

    const hasAccess = await this.verifyBoardAccess(cardRecord.boardId, userId);
    if (!hasAccess) {
      throw new Error("UNAUTHORIZED_BOARD_ACCESS");
    }

    const [deleted] = await db
      .delete(card)
      .where(eq(card.id, cardId))
      .returning();

    return deleted;
  },

  async archiveCard(cardId, userId) {
    return this.updateCard(cardId, userId, { archived: true });
  }
};
