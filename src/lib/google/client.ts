import { google } from 'googleapis'
import { env } from '../../env'
const credentials = JSON.parse(env.GOOGLE_CLIENT_CREDENTIALS)
export const oAuth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0],
)
oAuth2Client.setCredentials(JSON.parse(env.GOOGLE_ACCESS_TOKEN))
