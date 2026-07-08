import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { resolveDatabaseUrl } from './connection'

export const pool = new Pool({
  connectionString: resolveDatabaseUrl(process.env.DATABASE_URL),
})

export const db = drizzle(pool, { schema })
