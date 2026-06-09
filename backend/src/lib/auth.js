import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js"; // your drizzle instance

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),

  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    pathRules: {
        "signup": "/sign-up/email",
        "signin": "/sign-in/email"
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
