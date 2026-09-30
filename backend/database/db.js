import { JSONFilePreset } from "lowdb/node";

const defaultData = { users: [], messages: [] };

const db = await JSONFilePreset("./db.json", defaultData);

export default db;
