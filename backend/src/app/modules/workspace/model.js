import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { workspace, workspaceMember } from "../../../db/schema.js";
import { z } from "zod";


export const insertWorkspaceSchema = createInsertSchema(workspace);
export const selectWorkspaceSchema = createSelectSchema(workspace);

export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMember);


export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Workspace name is too long"),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();


export { workspace, workspaceMember };
