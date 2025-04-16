require("dotenv").config();
require("module-alias/register");

// Register extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { ActivityType } = require("discord.js");
const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");
const loadSlashCommands = require("@helpers/SlashCommandLoader");

// Load config
const config = require("@root/config.js");

validateConfiguration();

// Initialize client
const client = new BotClient();

// Load bot features
client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

// Ensure presence settings exist
if (!config.PRESENCE || typeof config.PRESENCE.ENABLED === "undefined") {
  throw new Error("PRESENCE.ENABLED is not defined in config.js");
}

// Status messages rotation
const presenceOptions = [
  { text: () => `Watching ${client.guilds.cache.size} servers`, type: ActivityType.Watching, status: "dnd" },
  { text: () => `Serving ${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)} members`, type: ActivityType.Watching, status: "idle" },
  { text: () => "Developed by @techarye", type: ActivityType.Playing, status: "online" },
  { text: () => "Use /help for commands", type: ActivityType.Listening, status: "dnd" },
  { text: () => `Beta Version: ${config.BETA_VERSION}`, type: ActivityType.Watching, status: "idle" },
  { text: () => `*changelogs to see changelogs`, type: ActivityType.Watching, status: "online" },
  { text: () => "sudo su", type: ActivityType.Playing, status: "dnd" },
  { text: () => "New update soon?", type: ActivityType.Watching, status: "idle" },
  { text: () => "Collecting members", type: ActivityType.Playing, status: "dnd" },
  { text: () => "Replying to staff members", type: ActivityType.Watching, status: "idle" },
  { text: () => "AutoMod Beta 1.0", type: ActivityType.Playing, status: "online" },
  { text: () => "Now open source on github!", type: ActivityType.Playing, status: "dnd" },
];

// Function to update bot presence (timer)
const updatePresence = () => {
  if (!client.user) return;

  let index = 0;
  setInterval(() => {
    if (!client.user) return;

    const option = presenceOptions[index % presenceOptions.length];

    client.user.setPresence({
      status: option.status,
      activities: [{
        name: option.text(),
        type: option.type,
        url: option.url || undefined,
      }],
    });

    client.logger.log(`Presence updated: "${option.text()}" | Status: ${option.status.toUpperCase()}`);
    index++;
  }, 20_000);
};

// Initialize bot
(async () => {
  await checkForUpdates();
    await initializeMongoose();

  await client.login(process.env.BOT_TOKEN);
  client.once("ready", async () => {
    client.logger.log(`Logged in as ${client.user.tag}`);

    updatePresence(); // Called only once here

    const slashCommands = loadSlashCommands(client);
    client.logger.log(`Loaded ${slashCommands.length} slash commands.`);

    try {
      await client.application.commands.set(slashCommands);
      client.logger.log(`✅ Successfully registered ${slashCommands.length} slash commands.`);
    } catch (error) {
      client.logger.error("❌ Failed to register slash commands:", error);
    }
  });
})();
