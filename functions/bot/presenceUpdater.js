const { ActivityType } = require("discord.js");

const presenceOptions = [
  { text: (client) => `Watching ${client.guilds.cache.size} servers`, type: ActivityType.Watching, status: "dnd" },
  { text: (client) => `Serving ${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)} members`, type: ActivityType.Watching, status: "idle" },
  { text: () => "Developed by @techarye", type: ActivityType.Playing, status: "online" },
  { text: () => "Use /help for commands", type: ActivityType.Listening, status: "dnd" },
  { text: (client) => `Version: v${client.config.STABLE_VERSION}`, type: ActivityType.Watching, status: "idle" },
  { text: () => "*changelogs to see changelogs", type: ActivityType.Watching, status: "online" },
  { text: () => "Stable version finally arrived!", type: ActivityType.Playing, status: "dnd" },
  { text: () => "AutoMod Beta 1.0", type: ActivityType.Playing, status: "online" },
];

let presenceInterval;

function startPresenceUpdater(client) {
  let index = 0;
  presenceInterval = setInterval(() => {
    if (!client.isReady()) return;

    const option = presenceOptions[index % presenceOptions.length];
    try {
      client.user.setPresence({
        status: option.status,
        activities: [{ name: option.text(client), type: option.type }],
      });
      client.logger.log(`Presence updated: "${option.text(client)}" | Status: ${option.status.toUpperCase()}`);
    } catch (err) {
      client.logger.error("Failed to update presence:", err);
    }

    index++;
  }, 10_000);
}

module.exports = { startPresenceUpdater };
