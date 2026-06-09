import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const connectionString =
	env.DATABASE_URL ?? 'postgresql://legwor:legwor@localhost:5432/legwor';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
