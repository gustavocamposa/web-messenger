import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const MESSAGE_MAX_LENGTH = 2000;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// "from" e "to" são palavras reservadas no SQL, por isso as colunas se chamam
// sender_id/recipient_id, mas no código continuam from/to como na API.
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    from: uuid("sender_id")
      .notNull()
      .references(() => users.id),
    to: uuid("recipient_id")
      .notNull()
      .references(() => users.id),
    text: varchar("text", { length: MESSAGE_MAX_LENGTH }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("messages_recipient_created_at_idx").on(table.to, table.createdAt),
    index("messages_conversation_idx").on(
      table.from,
      table.to,
      table.createdAt,
    ),
  ],
);
