require("dotenv").config();
require("module-alias/register");

const { EmbedBuilder, Colors } = require("discord.js");
const { BotClient } = require("@src/structures");
const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { validateConfiguration } = require("@helpers/Validator");
const loadSlashCommands = require("@helpers/SlashCommandLoader");

// Import functions from /functions/bot
const { startPresenceUpdater } = require("@functions/bot/presenceUpdater");

// Import extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const config = require("@root/config.js");
const { LOG_CHANNEL_ID } = config;

// Import counting message handler
const { countingMessageHandler } = require("@src/commands/fun/counting");

validateConfiguration();

const client = new BotClient();

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    if (client?.isReady()) {
      const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
      if (channel) {
        await channel.send("⚠️ Bot is shutting down...").catch(console.error);
      }
      await client.destroy();
      console.log("[SHUTDOWN] Discord client destroyed.");
    }

    const mongoose = require("mongoose");
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

        await channel.send({ embeds: [embed] }).catch(console.error);
      }

      // Start the presence updater after a delay
      setTimeout(() => startPresenceUpdater(client), 5000);

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

    // Counting message handler
    client.on("messageCreate", async (message) => {
      try {
        await countingMessageHandler(message);
      } catch (err) {
        client.logger.error("❌ Error in countingMessageHandler:", err);
      }
    });

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

        await channel.send({ embeds: [embed] }).catch(console.error);
      }
    }

    process.exit(1);
  }
})();
