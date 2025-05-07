require("dotenv").config();
require("module-alias/register");

const mongoose = require("mongoose");
const { ActivityType, EmbedBuilder, Colors } = require("discord.js");

const { BotClient } = require("@src/structures");
const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { validateConfiguration } = require("@helpers/Validator");
const loadSlashCommands = require("@helpers/SlashCommandLoader");

require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const config = require("@root/config.js");
const { LOG_CHANNEL_ID } = config;

validateConfiguration();

let client = new BotClient();

const presenceOptions = [
  { text: () => `Watching ${client.guilds.cache.size} servers`, type: ActivityType.Watching, status: "dnd" },
  { text: () => `Serving ${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)} members`, type: ActivityType.Watching, status: "idle" },
  { text: () => "Developed by @techarye", type: ActivityType.Playing, status: "online" },
  { text: () => "Use /help for commands", type: ActivityType.Listening, status: "dnd" },
  { text: () => `Version: V${config.BETA_VERSION}`, type: ActivityType.Watching, status: "idle" },
  { text: () => "*changelogs to see changelogs", type: ActivityType.Watching, status: "online" },
  { text: () => "Stable version finally arrived!", type: ActivityType.Playing, status: "dnd" },
  { text: () => "AutoMod Beta 1.0", type: ActivityType.Playing, status: "online" },
];

let presenceInterval;

function startPresenceUpdater() {
  let index = 0;
  presenceInterval = setInterval(() => {
    if (!client.isReady()) return;

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
  }, 20_000);
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    if (client?.isReady()) {
      const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
      if (channel) {
        channel.send("⚠️ Bot is shutting down...").catch(console.error);
      }
      await client.destroy();
      console.log("[SHUTDOWN] Discord client destroyed.");
    }

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("[SHUTDOWN] Mongoose connection closed.");
    }

    console.log("✅ Graceful shutdown complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

(async () => {
  try {
    await checkForUpdates();
    await initializeMongoose();

    await client.login(process.env.BOT_TOKEN);

    client.once("ready", async () => {
      client.logger.log(`✅ Logged in as ${client.user.tag}`);

      const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle("🟢 Bot Online")
          .setDescription(`Logged in as \`${client.user.tag}\``)
          .setFooter({ text: `Started at ${new Date().toLocaleString()}` });

        channel.send({ embeds: [embed] }).catch(console.error);
      }

      // Start the presence updater
      setTimeout(() => startPresenceUpdater(), 5000);

      try {
        const slashCommands = loadSlashCommands(client);
        client.logger.log(`✅ Loaded ${slashCommands.length} slash commands.`);
        await client.application.commands.set(slashCommands);
        client.logger.log("✅ Slash commands registered.");
      } catch (slashErr) {
        client.logger.error("❌ Failed to register slash commands:", slashErr);
      }
    });

    client.loadCommands("src/commands");
    client.loadContexts("src/contexts");
    client.loadEvents("src/events");

  } catch (err) {
    console.error("❌ Bot failed to start:", err);

    if (client?.isReady()) {
      const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor(Colors.Red)
          .setTitle("🔴 Bot Initialization Failed")
          .setDescription(`Error: \`${err.message || err}\``)
          .setFooter({ text: `Time: ${new Date().toLocaleString()}` });

        channel.send({ embeds: [embed] }).catch(console.error);
      }
    }

    process.exit(1);
  }
})();
