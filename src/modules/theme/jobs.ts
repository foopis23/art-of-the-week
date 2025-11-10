import type { Job } from '@/lib/job'
import { ThemeService } from '@/modules/theme/service'

export const themeJobs: Job[] = [
  {
    schedule: '0 15 * * *',
    options: {
      name: 'Theme Announcement',
    },
    execute: async () => {
      await ThemeService.generateThemeForAllGuilds()
    },
  },
]
