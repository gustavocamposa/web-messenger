import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não definido no .env");
}

const pool = new pg.Pool({ connectionString });

// Sem este listener, uma conexão ociosa que cai (banco reiniciado, Neon hibernando)
// derruba o processo inteiro. O pool descarta a conexão e abre outra na próxima query.
pool.on("error", (error) => {
  console.error("Conexão ociosa com o banco foi encerrada:", error.message);
});

const db = drizzle(pool, { schema });

export default db;
