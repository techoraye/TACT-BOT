# 📢 **Bot Changelog**

Stay up-to-date with the latest updates, improvements, and bug fixes for the bot. We continuously work on making your experience better and adding exciting new features!

---

## 🚀 **Stable Version: `v1.3.2`**

### New Features:

* **Server Ban System**: Introduced a server blacklist feature, `serverban`, that allows bot owners to manage banned servers using subcommands like:

  * `list`: View all currently banned servers.
  * `add`: Add a server to the ban list.
  * `remove`: Remove a server from the ban list.
    *(Available only to bot owners for security purposes)*

* **Bot Introduction Message**: Added a welcome feature that triggers a friendly introduction message whenever the bot joins a new server, making the bot's arrival more engaging and interactive.

* **Broadcast Command**: Implemented the `owner` command with a new subcommand, `broadcast`. This feature allows bot owners to send a custom message to every server where the bot is active, perfect for important announcements.

### Enhancements:

* **Help Menu Revamp**: The help menu has been redesigned for improved user experience. Now, the menu displays **7 commands per page** for better readability and navigation.

### Bug Fixes:

* **Bot Owner Command Fix**: Resolved an issue with bot owner commands that could potentially cause unexpected behavior or crashes.

* **Counting System Fix**:

  * Fixed the high score issue in the counting game, where the high score was not being properly saved to the database.
  * Improved the counting system so that it no longer sends multiple high score messages. Now, the bot will only notify users of the new high score once.

---

### 🔜 **Coming Soon**

* **`presence` Command**: The upcoming `presence` command will allow bot owners to manage the bot's presence with the following features:

  * **Add**: Set a custom status or activity.
  * **Remove**: Remove any active status or activity.
  * **Edit**: Modify existing presence settings.
  * **List**: View all currently set presence options.

Stay tuned for more updates!