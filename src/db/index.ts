import 'dotenv/config'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate as migrateSQLite } from 'drizzle-orm/bun-sqlite/migrator'

import { env } from '../env'
import * as schema from './schema'

export const db = drizzle(env.DB_FILE_NAME, {
  schema,
})

export async function migrate() {
  await migrateSQLite(db, { migrationsFolder: './drizzle' })
}
