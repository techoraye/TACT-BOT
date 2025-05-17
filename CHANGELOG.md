# 📢 TACT Changelog

Stay informed about the latest updates, features, and fixes. We’re committed to delivering the best experience!

---

## 🚀 Stable Release: `v1.5`

**Platform Support:**  
- Compatible with **Linux**, **Windows**, and **WSL**.

---

### ✨ New & Improved

- **/botinfo Command:**  
  Expanded details and improved clarity.

- **Advanced Ticket System (Admin Only):**
  - Fully redesigned setup with interactive modals and buttons.
  - Customizable welcome and creator messages, with live preview/editing.
  - Optional role pings on ticket creation.
  - Set ticket log channels during setup or via command.
  - Limit concurrent open tickets per user.
  - Ticket channels now include action buttons: Close, Transcript, Lock, Pin, Owner.
  - Automatic transcript generation and logging on close.
  - All actions are permission-checked and admin-controlled.

- **Counting System:**
  - Improved error handling and feedback.
  - Visual cues for correct/incorrect entries.

---

### 🛠️ Fixes

- Resolved permission issues in ticket and counting systems.
- Improved error messages for restricted commands.
- Fixed rare bugs with ticket cleanup and database resets.
- Fixed: Server data is now properly removed from all databases when the bot leaves a guild.

---

### 🔄 Changes

- **Command Cleanup:**  
  Removed legacy and unused commands for a streamlined experience.

- **Owner-Only Commands:**  
  Enhanced UI/UX for restricted access, making owner-only commands clearer.

- **Ticket System:**  
  - Simplified admin setup.
  - Added detailed logging and feedback for all ticket actions.
  - Improved database handling for ticket persistence and resets.

---

## 🔜 Coming Soon

### 🌐 `/presence` Command *(Bot Owner Only)*
- Manage the bot’s presence:
  - `add`: Set a new status/activity
  - `edit`: Modify an existing one
  - `remove`: Clear current presence
  - `list`: View active settings

### 📥 Mod Inbox (DM Support)
- Members can DM the bot for:
  - Help requests
  - Reports
  - Private moderation support

---

💡 More updates and features are on the way — stay tuned!