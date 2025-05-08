# 📢 Bot Changelogs

Stay updated with the latest changes and improvements to the bot.

---

## 🚀 Stable Version: `v1.3.0`

### 🆕 New Additions

- ✅ **Counting System**  
  - Implemented a global counting feature using a local JSON database.

- ✅ **Command Refactoring**  
  - Moved several commands to the `/functions` folder for better modularity.  
  - Introduced `/sub/` directories for handling subcommands in some modules.

- ✅ **New Owner Commands**  
  - `setversion`: Update the bot's current version.
  - `dev`: Add developers/testers with limited access (cannot run dangerous commands).
  - `commandpath`: View the file path of a specific command.
  - `listinvites`: Display all invite links from servers the bot is in.

- ✅ **Presence Updates**  
  - Animated presence functionality has been moved to separate functions in the root directory.

- ✅ **Wikipedia Command Overhaul**  
  - Fixed broken behavior and added smarter reply responses.

---

### 🔜 Coming Soon

- `presence` command to:
  - Add, remove, edit, and list bot presence options.

---