import { randomUUID } from "crypto";
import db from "./db.js";

async function createMessage({ from, to, text }) {
  const message = { id: randomUUID(), from, to, text };

  db.data.messages.push(message);
  await db.write();

  return message;
}

async function takeMessagesByUser(userId) {
  const received = db.data.messages.filter((message) => message.to === userId);
  db.data.messages = db.data.messages.filter(
    (message) => message.to !== userId,
  );
  await db.write();

  return received;
}

export { createMessage, takeMessagesByUser };
