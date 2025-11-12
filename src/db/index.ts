import 'dotenv/config'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { env } from '../env'
import type * as schema from './schema'

export const db = drizzle<typeof schema>(env.DB_FILE_NAME)
