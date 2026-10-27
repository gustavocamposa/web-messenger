import { asc, eq, getTableColumns } from "drizzle-orm";
import db from "./db.js";
import { messages, users } from "./schema.js";
import type { Message, MessageWithSender } from "../src/types.js";

type NewMessage = Pick<Message, "from" | "to" | "text">;

async function createMessage({ from, to, text }: NewMessage): Promise<Message> {
  const [message] = await db
    .insert(messages)
    .values({ from, to, text })
    .returning();

  return message;
}

async function getMessagesByUser(userId: string): Promise<MessageWithSender[]> {
  return db
    .select({ ...getTableColumns(messages), fromEmail: users.email })
    .from(messages)
    .innerJoin(users, eq(messages.from, users.id))
    .where(eq(messages.to, userId))
    .orderBy(asc(messages.createdAt));
}

export { createMessage, getMessagesByUser };
