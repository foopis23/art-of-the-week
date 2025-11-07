# Art of the Week
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
- [ ] Send Theme generation message
- [ ] Implement theme generation scheduling
- [ ] Integrate Google Drive API
- [ ] Create schema for tracking themes generated (date, theme, folder_id, message_id)
- [ ] Setup Google Drive folder creation when theme is generated "Theme Name - DD/MM/YY"
- [ ] Create schema for tracking submissions (user id, nickname, theme id, attachment link, timestamp)
- [ ] Monitor submission channel for replies with attachments
- [ ] Upload attachments to the corresponding Google Drive folder
- [ ] Update submission tracking in the database
- [ ] Dockerize the bot
- [ ] Testing and debugging
- [ ] Deploy
- [ ] Documentation
