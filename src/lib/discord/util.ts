import type { Client, Guild } from 'discord.js'

export async function findAllGuildsInCommonWithUser(client: Client, userId: string) {
  const partialGuilds = await client.guilds.fetch()
  const guilds: Guild[] = []

  for (const partialGuild of partialGuilds.values()) {
    const guild = await partialGuild.fetch()
    const member = await guild.members.fetch({ user: userId })
    if (!member) {
      continue
    }
    guilds.push(guild)
  }

  return guilds
}
