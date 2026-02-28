import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is missing in environment variables.");
}

// Configurazione base del client per TimescaleDB (PostgreSQL)
// Limitiamo max connections se usato in ambienti edge/serverless simili.
const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client);
