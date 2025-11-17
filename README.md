# Art Jam

## Description
Each week, we will generate a theme for art creation. Participants will create and submit their artwork based on the weekly theme. This discord bot will announce the theme, create a google drive folder for theme submissions, and upload submission (discord attachments in reply messages) to the folder (for archival purposes).

## Features
- Weekly Generated Themes
  - User Submissions
    - Streak Tracking (optional)
    - Google Drive Integration for Archival (optional)
- Per Guild Bot Configuration

## Usage
1. [Invite the bot](https://discord.com/oauth2/authorize?client_id=1436075080835792998&permissions=2251799813720064&integration_type=0&scope=bot) to your server
2. Run `/settings general` to configure the theme announcement channel

Themes are automatically announced at 3pm EST on the configured day (default: Monday). To start a jam immediately, run `/theme` to force generate one with a deadline set to the day before the next scheduled announcement.

### Google Drive Setup (optional)

3. Run `/settings google-drive` and follow the modal instructions to share your Google Drive folder with the bot. Paste the share link into the text input and submit. All future theme announcements will automatically create a submission folder in your Google Drive for archival purposes. 

## Development
### Vocab
- Theme: Simple text description. Usually one or two words, like "Gravity" or "Metal"
- Jam: In the context of this bot, is an event or period that starts with generation of a theme, can be submitted to by users, and ends at the deadline
- Submission: A submission is a user entry to a jam. It consist of an optional description and 1 to many attachments of the created art

### Potential Future Improvements
- Multi submission strategy
  - Allow Multi Submission? Maybe do something to separate them in google drive?
  - Maybe have a setting to control if its allow and different strategies for handling it? Replace, Keep Both, etc
- Setting for Allow Late Submissions
  - If disabled, submission button will be edited out of the message from all old themes when new themes is announced
  - probably also need a submission guard on the submission handler just to be sure
- Setting for Storage Format
  - flat (so its easier to look through the pictures)
  - folder per submission (so its more organized)
- More Storage Integrations
  - S3 Compatible Bucket
  - SFTP
- Custom Message Templates
  - the ability to make custom handler bar templates for messages directly in discord
  - the ability to enable or disable certain message types
    - reminder
    - recap
- Theme Reroll
  - Right now, there is a command to force generate a theme. But it would be nice if you could just reroll a previous theme and it would edit the original message and all that
  - Setting to enable emoji voting for reroll
- Theme Import Command
  - allow importing a list of themes from comma separated list or cvs file
- Theme Editor Web Application
  - allow a user to run a command that will send them a link to manager their discord's theme pool