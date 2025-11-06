import { Elysia } from 'elysia'
import { DiscordModel } from './model'
import { DiscordService } from './service'

export const discord = new Elysia({
  prefix: '/discord',
})
  .onRequest(async ({ request, status }) => {
    const signature = request.headers.get('X-Signature-Ed25519')
    const timestamp = request.headers.get('X-Signature-Timestamp')
    const rawBody = await request.clone().text() // Clone request to read raw body without consuming the original stream
    if (!signature || !timestamp || !rawBody) {
      return status(401)
    }
    if (!DiscordService.validateInteractionSignature(signature, timestamp, rawBody)) {
      return status(401)
    }
  })
  .post(
    '/interactions',
    async ({ body }) => {
      return await DiscordService.handleInteraction(body)
    },
    {
      body: DiscordModel.interactionBody,
    },
  )
  .listen(3000)
