# Art Jam Global Update

## Description 
We want it to be that all the guilds with the bot will announce the same theme each week. On top of that, we want user to be able to opt in to "global" submission. When its a submitted globally, its shared with all other users of the bot. Users will be able to view global submissions through a little gallery viewer message.

## Goals
- All guilds working on the same theme
  - If you are in multiple guilds with the bot and you make a submission, it will send a submissions message to all the guilds you are in
- Global submissions
  - Users can opt in to share there submissions publicly
  - Users can view all global submissions for a jam

## Secondary Objectives
- Implement PostHog Analytics and Error Monitoring
- Clean up some of the logging and error handling to be more unified where possible
- Theme suggestions

## Todo List
- [x] Setup dev environment for discord bot
- [ ] Remove Day of the week setting (it will be easier if all jams start and end on the same day across guilds)
  - [x] Remove setting from modal and submit handler
  - [x] Update timed messages to be fixed days
  - [x] Update deadline calculation to be fixed date
- [x] Generate Jam Globally and store in db
  - [x] Update Theme pool to be global instead of guild based
  - [x] Update /theme command to just display the current theme
- [ ] Implement submission in one guild sharing to all guilds you are in
- [ ] Update jam conclusion message to include global stats
- [ ] Add Public Submission Viewer
  - [ ] Command to see public submission
  - [ ] Message Template
  - [ ] Buttons to scroll through pages of submissions
- [ ] Clean up logging and error handling
  - Try to keep info and error handling at the top level unless error is expected or log is a debug log
- [ ] Implement PostHog Error Monitoring
- [ ] Implement PostHog Product Analytics
