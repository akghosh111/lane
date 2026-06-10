import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));


export const workspace = pgTable("workspace", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),

  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});


export const workspaceMember = pgTable("workspace_member", {
  id: text("id").primaryKey(),

  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  role: text("role").notNull().default("member"),

  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const board = pgTable("board", {
  id: text("id").primaryKey(),

  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),

  name: text("name").notNull(),

  description: text("description"),

  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});


export const boardList = pgTable("board_list", {
  id: text("id").primaryKey(),

  boardId: text("board_id")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),

  name: text("name").notNull(),

  position: integer("position").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const card = pgTable("card", {
  id: text("id").primaryKey(),

  boardId: text("board_id")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),

  listId: text("list_id")
    .notNull()
    .references(() => boardList.id, { onDelete: "cascade" }),

  title: text("title").notNull(),

  description: text("description"),

  position: integer("position").notNull(),

  priority: text("priority").default("medium"),

  dueDate: timestamp("due_date"),

  archived: boolean("archived")
    .default(false)
    .notNull(),

  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const cardAssignee = pgTable("card_assignee", {
  id: text("id").primaryKey(),

  cardId: text("card_id")
    .notNull()
    .references(() => card.id, {
      onDelete: "cascade",
    }),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
});


export const comment = pgTable("comment", {
  id: text("id").primaryKey(),

  cardId: text("card_id")
    .notNull()
    .references(() => card.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => user.id),

  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});



export const label = pgTable("label", {
  id: text("id").primaryKey(),

  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id, {
      onDelete: "cascade",
    }),

  name: text("name").notNull(),

  color: text("color").notNull(),
});


export const cardLabel = pgTable("card_label", {
  id: text("id").primaryKey(),

  cardId: text("card_id")
    .notNull()
    .references(() => card.id, {
      onDelete: "cascade",
    }),

  labelId: text("label_id")
    .notNull()
    .references(() => label.id, {
      onDelete: "cascade",
    }),
});


export const activity = pgTable("activity", {
  id: text("id").primaryKey(),

  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspace.id),

  userId: text("user_id")
    .notNull()
    .references(() => user.id),

  cardId: text("card_id")
    .references(() => card.id),

  action: text("action").notNull(),

  metadata: text("metadata"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});