// bot.js

require("dotenv").config();
require("module-alias/register");

const mongoose = require("mongoose");
const { ActivityType } = require("discord.js");

const { BotClient } = require("@src/structures");
const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { validateConfiguration } = require("@helpers/Validator");
const loadSlashCommands = require("@helpers/SlashCommandLoader");

require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const config = require("@root/config.js");

// Validate configuration
validateConfiguration();

// Initialize bot client
const client = new BotClient();

// Define rotating presence options
const presenceOptions = [
  { text: () => `Watching ${client.guilds.cache.size} servers`, type: ActivityType.Watching, status: "dnd" },
  { text: () => `Serving ${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)} members`, type: ActivityType.Watching, status: "idle" },
  { text: () => "Developed by @techarye", type: ActivityType.Playing, status: "online" },
  { text: () => "Use /help for commands", type: ActivityType.Listening, status: "dnd" },
  { text: () => `Beta Version: ${config.BETA_VERSION}`, type: ActivityType.Watching, status: "idle" },
  { text: () => "*changelogs to see changelogs", type: ActivityType.Watching, status: "online" },
  { text: () => "sudo su", type: ActivityType.Playing, status: "dnd" },
  { text: () => "New update soon?", type: ActivityType.Watching, status: "idle" },
  { text: () => "Collecting members", type: ActivityType.Playing, status: "dnd" },
  { text: () => "Replying to staff members", type: ActivityType.Watching, status: "idle" },
  { text: () => "AutoMod Beta 1.0", type: ActivityType.Playing, status: "online" },
  { text: () => "Now open source on GitHub!", type: ActivityType.Playing, status: "dnd" },
  { text: () => "Fixing issues", type: ActivityType.Playing, status: "dnd" },
];

let presenceInterval;

// Presence updater
function startPresenceUpdater() {
  if (!client.user) return;

  let index = 0;
  presenceInterval = setInterval(() => {
    if (!client.isReady()) return; // Ensure client is fully ready

    const option = presenceOptions[index % presenceOptions.length];

    try {
      client.user.setPresence({
        status: option.status,
        activities: [{ name: option.text(), type: option.type }],
      });

      client.logger.log(`Presence updated: "${option.text()}" | Status: ${option.status.toUpperCase()}`);
    } catch (err) {
      client.logger.error("Failed to update presence:", err);
    }

    index++;
  }, 20_000); // 20 seconds
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    clearInterval(presenceInterval);

    if (client.isReady()) {
      await client.destroy();
    }

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }

    console.log("✅ Shutdown complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Startup logic
(async () => {
  try {
    await checkForUpdates();
    await initializeMongoose();

    await client.login(process.env.BOT_TOKEN);

    client.once("ready", async () => {
      client.logger.log(`✅ Logged in as ${client.user.tag}`);
      
      // Wait 5 seconds to ensure Discord API is ready
      setTimeout(() => {
        startPresenceUpdater();
      }, 5000);

      try {
        const slashCommands = loadSlashCommands(client);
        client.logger.log(`✅ Loaded ${slashCommands.length} slash commands.`);

        await client.application.commands.set(slashCommands);
        client.logger.log(`✅ Successfully registered slash commands.`);
      } catch (slashErr) {
        client.logger.error("❌ Slash command registration failed:", slashErr);
      }
    });

    // Load handlers
    client.loadCommands("src/commands");
    client.loadContexts("src/contexts");
    client.loadEvents("src/events");
  } catch (initErr) {
    console.error("❌ Bot failed to initialize:", initErr);
    process.exit(1);
  }
})();
