import { eq, sql } from 'drizzle-orm/sql'
import { db } from '../../db'
import { availableThemesTable } from '../../db/schema'

export abstract class ThemeService {
  static async generateTheme(guildId: string): Promise<string | Error> {
    const result = await db
      .select()
      .from(availableThemesTable)
      .where(eq(availableThemesTable.guildId, guildId))
      .orderBy(sql`RANDOM()`)
      .limit(1)

    if (result.length === 0 || !result[0]) {
      return new Error('No themes found')
    }

    return result[0].theme
  }

  static async addThemes(guildId: string, themes: string[]): Promise<void> {
    await db.insert(availableThemesTable).values(themes.map((theme) => ({ guildId, theme })))
  }
}
