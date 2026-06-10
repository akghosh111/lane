import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { card } from "../../../db/schema.js";
import { z } from "zod";

export const insertCardSchema = createInsertSchema(card);
export const selectCardSchema = createSelectSchema(card);

export const createCardSchema = z.object({
  listId: z.string().min(1, "List ID is required"),
  title: z.string().min(1, "Title is required").max(255),
});

export const moveCardSchema = z.object({
  cardId: z.string().min(1),
  sourceListId: z.string().min(1),
  destinationListId: z.string().min(1),
  position: z.number().int().min(0),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  position: z.number().int().min(0).optional(),
  listId: z.string().min(1).optional(),
});

export { card };
