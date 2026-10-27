import bcrypt from "bcryptjs";
import { asc, eq, ne } from "drizzle-orm";
import db from "./db.js";
import { users } from "./schema.js";
import type { PublicUser, User } from "../src/types.js";

async function findUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}

async function findUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return user;
}

async function listAvailableUsers(excludeId: string): Promise<PublicUser[]> {
  return db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(ne(users.id, excludeId))
    .orderBy(asc(users.email));
}

// Retorna undefined se o email já estiver cadastrado.
async function createUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User | undefined> {
  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(users)
    .values({ email, passwordHash })
    .onConflictDoNothing({ target: users.email })
    .returning();

  return newUser;
}

export { findUserByEmail, findUserById, createUser, listAvailableUsers };
