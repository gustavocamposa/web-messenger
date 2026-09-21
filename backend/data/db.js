import { JSONFilePreset } from "lowdb/node";
import { fileURLToPath } from "url";

const file = fileURLToPath(new URL("./db.json", import.meta.url));

const defaultData = { users: [], messages: [] };

const db = await JSONFilePreset(file, defaultData);

db.data = { ...defaultData, ...db.data };
await db.write();

export default db;
