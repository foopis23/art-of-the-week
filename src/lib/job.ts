import type { CronCallback, CronOptions } from 'croner'

export type Job = {
  schedule: string | Date
  options?: CronOptions
  execute: CronCallback
}
