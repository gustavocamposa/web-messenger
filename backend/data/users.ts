import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import db from "./db.js";
import type { PublicUser, User } from "../src/types.js";

function findUserByEmail(email: string): User | undefined {
  return db.data.users.find((user) => user.email === email);
}

function findUserById(id: string): User | undefined {
  return db.data.users.find((user) => user.id === id);
}

function listAvailableUsers(excludeId: string): PublicUser[] {
  return db.data.users
    .filter((user) => user.id !== excludeId)
    .map(({ id, email }) => ({ id, email }));
}

async function createUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User> {
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = { id, email, passwordHash };

  await db.update(({ users }) => users.push(newUser));

  return newUser;
}

export { findUserByEmail, findUserById, createUser, listAvailableUsers };
