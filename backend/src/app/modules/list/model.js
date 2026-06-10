import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { boardList } from "../../../db/schema.js";
import { z } from "zod";

export const insertListSchema = createInsertSchema(boardList);
export const selectListSchema = createSelectSchema(boardList);

export const createListSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
  name: z.string().min(1, "List name is required").max(100),
  position: z.number().int().min(0),
});

export const updateListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  position: z.number().int().min(0).optional(),
});

export const reorderListsSchema = z.object({
  boardId: z.string().min(1),
  lists: z.array(z.object({
    id: z.string().min(1),
    position: z.number().int().min(0),
  })),
});

export { boardList };
