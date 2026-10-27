import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não definido no .env");
}

const pool = new pg.Pool({ connectionString });

const db = drizzle(pool, { schema });

export default db;
