// src/handlers/presence.js
const { ActivityType } = require('discord.js');

function updatePresence(client) {
  let message = client.config.PRESENCE.MESSAGE || 'Default message';

  if (message.includes("{servers}")) {
    message = message.replaceAll("{servers}", client.guilds.cache.size);
  }

  if (message.includes("{members}")) {
    const members = client.guilds.cache
      .map((g) => g.memberCount)
      .reduce((partial_sum, a) => partial_sum + a, 0);
    message = message.replaceAll("{members}", members);
  }

  const getType = (type) => {
    switch (type) {
      case "COMPETING":
        return ActivityType.Competing;
      case "LISTENING":
        return ActivityType.Listening;
      case "PLAYING":
        return ActivityType.Playing;
      case "WATCHING":
        return ActivityType.Watching;
      default:
        return ActivityType.Playing;
    }
  };

  client.user.setPresence({
    status: client.config.PRESENCE.STATUS,
    activities: [
      {
        name: message,
        type: getType(client.config.PRESENCE.TYPE),
      },
    ],
  });
}

module.exports = updatePresence;  // This should be the export
