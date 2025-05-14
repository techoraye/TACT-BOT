# 📢 **Bot Changelog**

Keep track of all recent changes, improvements, and upcoming features for the bot. We’re always working behind the scenes to bring you better performance, more functionality, and a smoother experience.

---

## 🚀 **Stable Release: `v1.3.3`**

### ✅ **New Features**

* **`/pay` Command Added**
  Users can now securely transfer coins to each other using the `/pay` command.
  Includes validation for:

  * Preventing self-payments and bot transactions
  * Ensuring sufficient wallet balance
  * Real-time balance updates via embedded response

---

### 🛠️ **Fixes**

* **`/wikipedia` Command Bug Fixed**
  The Wikipedia command is now working correctly with improved error handling and cleaner output formatting.

* **Console Logging Issue Resolved**
  GitHub update alerts were previously logging unnecessary or duplicate messages to the console — now streamlined and silent unless relevant.

---

### 🔄 **Changes**

* **`embed/say` Command Temporarily Removed**
  This command has been disabled due to internal issues and is currently undergoing rework.
  ⚠️ *It will be reintroduced in an upcoming patch once fully fixed.*

---

## 🔜 **Coming Soon**

### 🌐 **`presence` Command (Bot Owner Only)**

Manage the bot’s presence in real-time:

* `add`: Set a new custom status/activity (e.g., playing, watching, streaming)
* `edit`: Modify an existing activity
* `remove`: Clear current presence
* `list`: View active presence settings

### 📥 **Mod Inbox (DM Support)**

Allow server members to DM the bot for help, reports, or modmail-like support. Great for handling issues privately and professionally.

---

💡 **Stay tuned for more features, refinements, and performance improvements in the upcoming releases!**