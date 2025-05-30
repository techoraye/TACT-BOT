const { ActivityType } = require("discord.js");

function startPresenceUpdater(client) {
  if (!client.isReady()) return;

  try {
    client.user.setPresence({
      status: "idle",
      activities: [{
        name: `v${client.config.STABLE_VERSION}`,
        type: ActivityType.Watching
      }]
    });

    client.logger.log(`Presence set to version: "v${client.config.STABLE_VERSION}"`);
  } catch (err) {
    client.logger.error("Failed to set presence:", err);
  }
}

module.exports = { startPresenceUpdater };
