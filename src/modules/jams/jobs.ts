import type { Job } from '@/lib/job'
import { JamService } from '@/modules/jams/service'

export const jamJobs: Job[] = [
  {
    schedule: '0 15 * * MON',
    options: {
      name: 'Theme Announcement',
    },
    execute: async () => {
      await JamService.generateJam()
    },
  },
  {
    schedule: '0 15 * * THU',
    options: {
      name: 'Midweek Reminder',
    },
    execute: async () => {
      await JamService.sendMidweekReminderForAllScheduledGuilds()
    },
  },
  {
    schedule: '0 9 * * MON',
    options: {
      name: 'Jam Recap',
    },
    execute: async () => {
      await JamService.sendJamRecapMessage()
    },
  },
]
