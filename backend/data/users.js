import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import db from "./db.js";

function findUserByEmail(email) {
  return db.data.users.find((user) => user.email === email);
}

function findUserById(id) {
  return db.data.users.find((user) => user.id === id);
}

async function createUser({ email, password }) {
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { id, email, passwordHash };

  db.data.users.push(newUser);
  await db.write();

  return newUser;
}

export { findUserByEmail, findUserById, createUser };
