# Changelog

## [Beta v0.9.1] - 2025-05-05

### Major Enhancements
- **Presence System Revamp**: Rotating presence with dynamic stats every 20 seconds.
- **Config Validation**: Checks for presence settings before startup.
- **Slash Command Loader**: Auto-registers all slash commands at launch.
- **Improved Startup Sequence**: Clean boot flow with enhanced logging.

### What We Did
- Optimized the database interaction layer for improved performance.
- Refined internal command handling to reduce latency.
- Added detailed logging for presence and slash command loading.
- Improved error handling and feedback for failed interactions.

### Bug Fixes
- Fixed issue where balance was not updating correctly in the economy system.
- Resolved embed formatting issues in the ticket system.
- Fixed bot permissions bug that was blocking command execution.

### Minor Updates
- `/changelogs` now shows detailed logs categorized by type.
- Added support for aliases like `/updates` and `/news`.
- Cleaner formatting with emojis and embed design improvements.
