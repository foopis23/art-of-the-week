import 'dotenv/config'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { env } from '../env'
import * as schema from './schema'

export const db = drizzle(env.DB_FILE_NAME, {
  schema,
})
