import { randomUUID } from "crypto";
import db from "./db.js";

async function createMessage({ from, to, text }) {
  const message = {
    id: randomUUID(),
    from,
    to,
    text,
    createdAt: new Date().toISOString(),
  };

  await db.update(({ messages }) => messages.push(message));

  return message;
}

function getMessagesByUser(userId) {
  return db.data.messages.filter((message) => message.to === userId);
}

export { createMessage, getMessagesByUser };
