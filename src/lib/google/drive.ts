import { google } from 'googleapis'
import { oAuth2Client } from './client'

export const drive = google.drive({ version: 'v3', auth: oAuth2Client })
