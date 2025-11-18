# Art Jams

## Description
Each week, we will generate a theme for art creation. Participants will create and submit their artwork based on the weekly theme. This discord bot will announce the theme, create a google drive folder for theme submissions,and upload submission (discord attachments in reply messages) to the folder (for archival purposes).

## Goals

- Weekly Theme Generation
  - Use a predefined list of themes
- Discord Bot Functionality
  - Announce themes
  - Monitor submission channels for replies with attachments.
- Google Drive Integration
  - Create folders
  - Upload files using Google Drive API.
- Submission Tracking
  - Keep track of who submitted what and when
    - If a user submits multiple times, only the latest submission is kept.
    - Maybe implement streaks for weekly participation.

### Stretch Goals
- Theme Rerolls
  - Allow users to vote to reroll the theme if they don't like it.
- Theme suggestions
  - Allow users to suggest themes for future weeks
- Theme Import
  - command for importing theme list from csv
- Themes Editor
  - Web page for bulk editing/view available themes

## Todo List

- [x] Set up Project
- [x] Create ping command
  - [x] Create Command Builder
  - [x] Create Command Registry
  - [x] Create Slash Command Handler
  - [x] Create Slash Command Register CLI Tool
- [x] Setup sqlite db
- [x] Create schema for available themes (list of themes)
- [x] Create theme generation
- [x] Configure Theme for Guild
  - [x] Theme announcement channel
- [x] Send Theme generation message
- [x] Implement theme generation scheduling
- [x] Deduplicate themes so that every theme in the pool has to used before you generating a previous one
- [x] Integrate Google Drive API
- [x] Create Theme Submission Message Component
  - [x] Create Button Interaction
  - [x] Open Modal on Button Press
  - [x] Handle Modal Submission
- [x] Create schema for tracking submissions (user id, nickname, theme id, attachment link, timestamp)
- [x] Implement Google Drive Setup Process
- [x] Setup Google Drive folder creation when theme is generated "Theme Name - DD/MM/YY"
- [x] Upload attachments to the corresponding Google Drive folder
- [x] Update submission tracking in the database
- [x] Create schema for tracking themes generated (date, theme, folder_id, message_id)
- [x] Testing and debugging
  - [x] Fixed Google Drive Upload Edge Cases
  - [x] Fixed Date Formats
  - [x] Fix Deadline date calculation (use cron schedule to figure out when next announcement is)
- [x] Add midweek reminder messages
- [x] Add jam recap message
- [x] Dockerize the bot
- [x] Deploy
- ~~[ ] Add PostHog Error Tracking and Analytics~~
- [x] Documentation
