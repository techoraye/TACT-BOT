require("dotenv").config();
require("module-alias/register");

const { EmbedBuilder, Colors } = require("discord.js");
const { BotClient } = require("@src/structures");
const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { validateConfiguration } = require("@helpers/Validator");
const loadSlashCommands = require("@helpers/SlashCommandLoader");
const fs = require("fs");
const path = require("path");

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

// Blacklist path
const blacklistPath = path.join(__dirname, "./database/blacklist.json");

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

    // Load bot systems
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

    // Guild Create Blacklist Handler
    client.on("guildCreate", async (guild) => {
      try {
        const raw = fs.readFileSync(blacklistPath, "utf8");
        const blacklist = JSON.parse(raw);

        if (blacklist.servers.includes(guild.id)) {
          client.logger.warn(`🚫 Blacklisted server (${guild.name} | ${guild.id}) attempted to invite the bot.`);
          await guild.leave().catch((err) =>
            client.logger.error("❌ Failed to leave blacklisted server:", err)
          );
        }
      } catch (err) {
        client.logger.error("❌ Error checking blacklist on guildCreate:", err);
      }
    });

    client.on("guildCreate", async (guild) => {
      try {
        // Delay to make sure bot is fully ready before sending
        setTimeout(async () => {
          const embed = new EmbedBuilder()
            .setTitle("🤖 Thanks for adding TACT!")
            .setColor(Colors.Green)
            .setDescription(
              `Hello **${guild.name}**! 👋\n\n` +
              `I'm **TACT**, your all-in-one Discord bot for moderation, utilities, fun, and more!\n\n` +
              `📌 **Changelogs:** Use \`/changelogs\` to see the latest updates.\n` +
              `📚 **Commands:** Use \`/help\` to view all available commands.\n` +
              `ℹ️ **Bot Info:** Use \`/botinfo\` to learn more about what I can do.\n` +
              `👨‍💻 **Developer Info:** Use \`/devinfo\` to find out who's behind TACT.\n\n` +
              `Need help? Join our support server: [discord.gg/M7yyGfKdKx](https://discord.gg/M7yyGfKdKx)`
            )
            .setFooter({ text: "Welcome aboard!" })
            .setTimestamp();
    
          // Try to send to system channel or fallback
          let targetChannel = guild.systemChannel;
    
          if (
            !targetChannel ||
            !targetChannel.permissionsFor(guild.members.me).has("SendMessages")
          ) {
            targetChannel = guild.channels.cache.find(
              (ch) =>
                ch.isTextBased() &&
                ch.permissionsFor(guild.members.me).has("SendMessages") &&
                !ch.isThread()
            );
          }
    
          if (targetChannel) {
            await targetChannel.send({ embeds: [embed] });
            client.logger.log(`✅ Sent join message in ${guild.name}`);
          } else {
            client.logger.warn(`⚠️ Could not find a suitable channel in ${guild.name} to send the join message.`);
          }
        }, 3000);
      } catch (err) {
        client.logger.error("❌ Error sending welcome message on guildCreate:", err);
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
