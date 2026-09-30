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

function getConversation(userA, userB, limit = 50) {
  return db.data.messages
    .filter(
      (message) =>
        (message.from === userA && message.to === userB) ||
        (message.from === userB && message.to === userA),
    )
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? "")) // ordena da mais antiga pra mais recente
    .slice(-limit); // slice -50 pega as 50 mais recentes
}
export { createMessage, getMessagesByUser, getConversation };
