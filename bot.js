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

const fs = require("fs");
const path = require("path");

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
  { text: () => "Fixing issues", type: ActivityType.Playing, status: "dnd" },
];

// Function to update bot presence (timer)
const updatePresence = () => {
  if (!client.user) return;

  let index = 0;
  let previousPresence = ''; // Store the previous presence to compare

  setInterval(() => {
    if (!client.user) return;

    const option = presenceOptions[index % presenceOptions.length];
    const currentPresence = option.text();

    if (currentPresence !== previousPresence) {
      client.user.setPresence({
        status: option.status,
        activities: [{
          name: currentPresence,
          type: option.type,
          url: option.url || undefined,
        }],
      });

      client.logger.log(`Presence updated: "${currentPresence}" | Status: ${option.status.toUpperCase()}`);
      previousPresence = currentPresence; // Update the previous presence
    }
    
    index++;
  }, 60_000); // Update every 60 seconds (increased from 20 seconds)
};

// Function to remove the server data from data.json
const removeServerData = (guildId) => {
  const dataFilePath = path.join(__dirname, "../data.json");
  try {
    // Read data from the file
    const data = require(dataFilePath);

    // Check if the server data exists
    if (data[guildId]) {
      // Delete the server data entirely
      delete data[guildId]; 
      
      // Write the updated data back to the file
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2)); 
      client.logger.log(`Data removed for guild ${guildId} from data.json.`);
    } else {
      client.logger.warn(`No data found for guild ${guildId} in data.json.`);
    }
  } catch (error) {
    client.logger.error(`Failed to remove data for guild ${guildId}:`, error);
  }
};

// Auto-leave system (checking for inactive servers)
const startAutoLeaveChecker = async () => {
  const leaveThreshold = 14 * 24 * 60 * 60 * 1000; // 2 weeks (in milliseconds)
  const warningThreshold = leaveThreshold - 24 * 60 * 60 * 1000; // 1 day before the 2 weeks, send a warning

  setInterval(async () => {
    const now = Date.now();
    const inactiveGuilds = client.guilds.cache.filter((guild) => {
      const lastMessageTime = guild.lastMessage ? guild.lastMessage.createdTimestamp : 0;
      return now - lastMessageTime > leaveThreshold;
    });

    // If no guilds to leave, skip
    if (inactiveGuilds.size === 0) {
      client.logger.log('No inactive guilds to leave.');
      return;
    }

    // Warn about inactivity 1 day before leaving
    for (const guild of inactiveGuilds.values()) {
      const lastMessageTime = guild.lastMessage ? guild.lastMessage.createdTimestamp : 0;
      if (now - lastMessageTime > warningThreshold && now - lastMessageTime < leaveThreshold) {
        // Send a warning message to the guild (if possible)
        try {
          const defaultChannel = guild.channels.cache.find(c => c.type === 'GUILD_TEXT');
          if (defaultChannel) {
            await defaultChannel.send("🚨 **Warning**: This server has been inactive for almost 2 weeks and will be automatically left if inactivity continues. Please engage to avoid this.");
            client.logger.log(`Warning sent to guild: ${guild.name} | Guild ID: ${guild.id}`);
          }
        } catch (error) {
          client.logger.error(`Failed to send warning to guild ${guild.name} | Guild ID: ${guild.id}:`, error);
        }
      }
    }

    // Leave guilds after 2 weeks of inactivity
    for (const guild of inactiveGuilds.values()) {
      const lastMessageTime = guild.lastMessage ? guild.lastMessage.createdTimestamp : 0;
      if (now - lastMessageTime > leaveThreshold) {
        try {
          // Remove server data 5 seconds before leaving
          removeServerData(guild.id);

          // Wait 5 seconds before leaving the guild
          setTimeout(async () => {
            await guild.leave(); // The bot leaves the inactive guild
            client.logger.log(`Left inactive guild: ${guild.name} | Guild ID: ${guild.id}`);
          }, 5000); // 5 seconds delay before leaving
        } catch (error) {
          client.logger.error(`Failed to leave inactive guild ${guild.name} | Guild ID: ${guild.id}:`, error);
        }
      }
    }
  }, 30 * 60 * 1000); // Check every 30 minutes (increased from 15 minutes)
};

// Initialize bot
(async () => {
  await checkForUpdates();
  await initializeMongoose();

  await client.login(process.env.BOT_TOKEN);
  client.once("ready", async () => {
    client.logger.log(`Logged in as ${client.user.tag}`);

    updatePresence(); // Called only once here

    // Start the auto-leave checker
    startAutoLeaveChecker(); // Start the auto-leave process

    const slashCommands = loadSlashCommands(client);
    // Log only if slash commands are successfully loaded
    if (slashCommands.length > 0) {
      client.logger.log(`Successfully loaded ${slashCommands.length} slash commands.`);
    }

    try {
      await client.application.commands.set(slashCommands);
      client.logger.log(`✅ Successfully registered ${slashCommands.length} slash commands.`);
    } catch (error) {
      client.logger.error("❌ Failed to register slash commands:", error);
    }
  });
})();
