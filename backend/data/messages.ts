import { randomUUID } from "crypto";
import db from "./db.js";
import type { Message } from "../src/types.js";

type NewMessage = Pick<Message, "from" | "to" | "text">;

async function createMessage({ from, to, text }: NewMessage): Promise<Message> {
  const message: Message = {
    id: randomUUID(),
    from,
    to,
    text,
    createdAt: new Date().toISOString(),
  };

  await db.update(({ messages }) => messages.push(message));

  return message;
}

function getMessagesByUser(userId: string): Message[] {
  return db.data.messages.filter((message) => message.to === userId);
}

export { createMessage, getMessagesByUser };
