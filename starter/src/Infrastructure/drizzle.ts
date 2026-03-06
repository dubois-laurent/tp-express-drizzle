import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "./DB";

export const db = drizzle(pool);
