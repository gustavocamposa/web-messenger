import { JSONFilePreset } from "lowdb/node";
import type { DatabaseSchema } from "../src/types.js";

const defaultData: DatabaseSchema = { users: [], messages: [] };

const db = await JSONFilePreset<DatabaseSchema>("./db.json", defaultData);

export default db;
