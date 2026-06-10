import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js"; // your drizzle instance
import { workspace, workspaceMember, board, boardList } from "../db/schema.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const workspaceId = crypto.randomUUID();
          const boardId = crypto.randomUUID();
          
          await db.insert(workspace).values({
            id: workspaceId,
            name: `${user.name}'s Workspace`,
            ownerId: user.id,
          });

          await db.insert(workspaceMember).values({
            id: crypto.randomUUID(),
            workspaceId: workspaceId,
            userId: user.id,
            role: "owner",
          });

          await db.insert(board).values({
            id: boardId,
            workspaceId: workspaceId,
            name: "Main Board",
            createdBy: user.id,
          });

          const defaultLists = ["Todo", "In Progress", "Done"];
          for (const [index, name] of defaultLists.entries()) {
            await db.insert(boardList).values({
              id: crypto.randomUUID(),
              boardId: boardId,
              name: name,
              position: index,
            });
          }
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    pathRules: {
        "signup": "/sign-up/email",
        "signin": "/sign-in/email",
        "signout": "/sign-out"
    }
  },

  trustedOrigins: ["http://localhost:5173", "http://localhost:3000"],
//   socialProviders: {
//     github: {
//       clientId: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     },
//   },
});
