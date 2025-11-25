import { EventSchemas, Inngest } from 'inngest'
import z from 'zod'
import { JamModel } from '../jams/model'
import { SettingsModel } from '../settings/model'

export const inngest = new Inngest({
  id: 'art-jam',
  schemas: new EventSchemas().fromSchema({
    'jam.notification.announcement': z.object({
      jam: JamModel.jamSchema,
      guild: SettingsModel.guildSettingsSchema,
    }),
    'jam.notification.reminder': z.object({
      jam: JamModel.jamSchema,
      guild: SettingsModel.guildSettingsSchema,
    }),
    'jam.notification.recap': z.object({
      jam: JamModel.jamSchema,
      guild: SettingsModel.guildSettingsSchema,
    }),
  }),
})
