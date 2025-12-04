import { JamService } from '@/modules/jams/service'
import type { TimeStr } from 'inngest'
import { inngest } from '../inngest/inngest'
import { SettingsService } from '../settings/service'

const THROTTLE_SETTINGS = {
  limit: 50,
  period: '5s',
  burst: 5,
} satisfies {
  key?: string
  limit: number
  period: TimeStr
  burst?: number
}

export const generateJamFunction = inngest.createFunction(
  {
    id: 'generate-jam',
  },
  {
    cron: 'TZ=America/New_York 0 12 * * MON',
  },
  async ({ step }) => {
    const jam = await step.run('generate-jam', async () => {
      return await JamService.generateJam()
    })

    const guildsToNotify = await step.run('get-guilds-to-notify', async () => {
      return await SettingsService.listAllWithThemeAnnouncementChannel()
    })

    await step.sendEvent(
      'fan-out-theme-notifications',
      guildsToNotify.map((guild) => {
        return {
          name: 'jam.notification.announcement',
          data: {
            jam: jam,
            guild: guild,
          },
        }
      }),
    )
  },
)

export const jamAnnouncementNotificationFunction = inngest.createFunction(
  {
    id: 'handle-theme-announcement',
    throttle: {
      limit: 50,
      period: '5s',
      burst: 5,
    },
  },
  {
    event: 'jam.notification.announcement',
  },
  async ({ step, event }) => {
    const guildSettings = event.data.guild
    const jam = event.data.jam

    const themeAnnouncementChannelId = guildSettings.themeAnnouncementChannelId
    if (!themeAnnouncementChannelId) {
      throw new Error('No theme announcement channel id, this should not happen')
    }

    await step.run('send-jam-announcement', async () => {
      return await JamService.sendJamAnnouncement(jam, guildSettings)
    })

    if (guildSettings.googleDriveEnabled) {
      await step.run('create-theme-submission-folder', async () => {
        return await JamService.createThemeSubmissionFolderForJam({
          ...guildSettings,
          themeAnnouncementChannelId,
          jamId: jam.id,
          theme: jam.theme,
          jamDate: jam.createdAt,
        })
      })
    }
  },
)

export const fanOutJamReminderNotificationsFunction = inngest.createFunction(
  {
    id: 'fan-out-jam-reminder-notifications',
  },
  {
    cron: 'TZ=America/New_York 0 12 * * THU',
  },
  async ({ step }) => {
    const jam = await JamService.getCurrentJam()

    if (!jam) {
      throw new Error('No current jam found')
    }

    const guildsToNotify = await step.run('get-guilds-to-notify', async () => {
      return await SettingsService.listAllWithThemeAnnouncementChannel()
    })

    await step.sendEvent(
      'fan-out-jam-reminder-notifications',
      guildsToNotify.map((guild) => ({
        name: 'jam.notification.reminder',
        data: {
          jam: jam,
          guild: guild,
        },
      })),
    )
  },
)

export const jamMidweekReminderNotificationFunction = inngest.createFunction(
  {
    id: 'handle-jam-midweek-reminder',
    throttle: {
      limit: 50,
      period: '5s',
      burst: 5,
    },
  },
  {
    event: 'jam.notification.reminder',
  },
  async ({ step, event }) => {
    const guildSettings = event.data.guild
    const jam = event.data.jam

    await step.run('send-jam-midweek-reminder', async () => {
      return await JamService.sendJamMidweekReminderToGuild(jam, guildSettings)
    })
  },
)

export const fanOutJamRecapNotificationsFunction = inngest.createFunction(
  {
    id: 'fan-out-jam-recap-notifications',
  },
  {
    cron: 'TZ=America/New_York 0 9 * * MON',
  },
  async ({ step }) => {
    const jam = await JamService.getLatestJam()
    if (!jam) {
      throw new Error('No latest jam found')
    }

    const guildsToNotify = await step.run('get-guilds-to-notify', async () => {
      return await SettingsService.listAllWithThemeAnnouncementChannel()
    })

    await step.sendEvent(
      'fan-out-jam-recap-notifications',
      guildsToNotify.map((guild) => ({
        name: 'jam.notification.recap',
        data: { jam: jam, guild: guild },
      })),
    )
  },
)

export const jamRecapNotificationFunction = inngest.createFunction(
  {
    id: 'handle-jam-recap',
    throttle: THROTTLE_SETTINGS,
  },
  {
    event: 'jam.notification.recap',
  },
  async ({ step, event }) => {
    const guildSettings = event.data.guild
    const jam = event.data.jam

    await step.run('send-jam-recap', async () => {
      return await JamService.sendJamRecapMessageToGuild(jam, guildSettings)
    })
  },
)

export const jamFunctions = [
  generateJamFunction,
  jamAnnouncementNotificationFunction,
  fanOutJamReminderNotificationsFunction,
  jamMidweekReminderNotificationFunction,
  fanOutJamRecapNotificationsFunction,
  jamRecapNotificationFunction,
]
