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
  },

  async moveCard(userId, { cardId, sourceListId, destinationListId, position }) {
    // 1. Verify access to both lists (or board they belong to)
    const sourceAccess = await this.verifyListAccess(sourceListId, userId);
    const destAccess = await this.verifyListAccess(destinationListId, userId);

    if (!sourceAccess || !destAccess) {
      throw new Error("UNAUTHORIZED_LIST_ACCESS");
    }

    return await db.transaction(async (tx) => {
      // 2. Fetch the card to be moved
      const [targetCard] = await tx
        .select()
        .from(card)
        .where(and(eq(card.id, cardId), eq(card.listId, sourceListId)));

      if (!targetCard) throw new Error("CARD_NOT_FOUND");

      const oldPosition = targetCard.position;

      if (sourceListId === destinationListId) {
        // --- Same List Move ---
        if (oldPosition === position) return targetCard;

        if (oldPosition < position) {
          // Move down: shift cards between old and new position up
          await tx
            .update(card)
            .set({ position: sql`${card.position} - 1` })
            .where(
              and(
                eq(card.listId, sourceListId),
                sql`${card.position} > ${oldPosition}`,
                sql`${card.position} <= ${position}`
              )
            );
        } else {
          // Move up: shift cards between new and old position down
          await tx
            .update(card)
            .set({ position: sql`${card.position} + 1` })
            .where(
              and(
                eq(card.listId, sourceListId),
                sql`${card.position} < ${oldPosition}`,
                sql`${card.position} >= ${position}`
              )
            );
        }
      } else {
        // --- Cross List Move ---
        // A. Shift cards in SOURCE list down (fill the gap)
        await tx
          .update(card)
          .set({ position: sql`${card.position} - 1` })
          .where(
            and(
              eq(card.listId, sourceListId),
              sql`${card.position} > ${oldPosition}`
            )
          );

        // B. Shift cards in DESTINATION list up (make room)
        await tx
          .update(card)
          .set({ position: sql`${card.position} + 1` })
          .where(
            and(
              eq(card.listId, destinationListId),
              sql`${card.position} >= ${position}`
            )
          );
      }

      // 3. Finalize the move
      const [updatedCard] = await tx
        .update(card)
        .set({
          listId: destinationListId,
          position: position,
          updatedAt: new Date(),
        })
        .where(eq(card.id, cardId))
        .returning();

      return updatedCard;
    });
  }
};
