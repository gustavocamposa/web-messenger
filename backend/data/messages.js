import { randomUUID } from "crypto";
import db from "./db.js";

async function createMessage({ from, to, text }) {
  const message = { id: randomUUID(), from, to, text };

  await db.update(({ messages }) => messages.push(message));

  return message;
}

async function takeMessagesByUser(userId) {
  let received = [];

  await db.update(({ messages }) => {
    received = messages.filter((message) => message.to === userId);

    return messages.filter((message) => message.to !== userId);
  });

  return received;
}

export { createMessage, takeMessagesByUser };
