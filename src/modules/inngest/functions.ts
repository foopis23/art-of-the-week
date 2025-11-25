import { log } from '@/log'
import { jamFunctions } from '@/modules/jams/functions'
import * as Sentry from '@sentry/node'
import { inngest } from './inngest'

export const functions = [
  ...jamFunctions,
  inngest.createFunction(
    {
      id: 'global-failure-handler',
    },
    {
      event: 'inngest/function.failed',
    },
    async ({ event }) => {
      log.error(event, 'Inngest Function failed!')
      Sentry.captureException(event.data.error)
    },
  ),
]
