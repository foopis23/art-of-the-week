import type { Job } from '@/lib/job'
import { JamService } from '@/modules/jams/service'

export const jamJobs: Job[] = [
  {
    schedule: '0 15 * * *',
    options: {
      name: 'Theme Announcement',
    },
    execute: async () => {
      await JamService.generateJamForAnyScheduledGuilds()
    },
  },
  {
    schedule: '0 15 * * *',
    options: {
      name: 'Midweek Reminder',
    },
    execute: async () => {
      await JamService.sendMidweekReminderForAllScheduledGuilds()
    },
  },
]
