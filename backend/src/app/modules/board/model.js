import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { board, boardList } from "../../../db/schema.js";
import { z } from "zod";

export const insertBoardSchema = createInsertSchema(board);
export const selectBoardSchema = createSelectSchema(board);

export const createBoardSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace ID").or(z.string().min(1)), // Supporting both UUID and text IDs as per schema
  name: z.string().min(1, "Board name is required").max(100),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100),
});

export { board, boardList };
