const { ActivityType } = require("discord.js");

function startPresenceUpdater(client) {
  if (!client.isReady()) return;

  try {
    client.user.setPresence({
      status: "idle",
      activities: [{
        name: `Version: v${client.config.STABLE_VERSION}`, // Custom status with verified badge emoji
        type: ActivityType.Custom
      }]
    });

    client.logger.log(`Presence set to custom status: "v${client.config.STABLE_VERSION}"`);
  } catch (err) {
    client.logger.error("Failed to set presence:", err);
  }
}

module.exports = { startPresenceUpdater };
