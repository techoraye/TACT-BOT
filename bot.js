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
<<<<<<< HEAD
client.once("ready", async () => {
  client.logger.log(`Logged in as ${client.user.tag}`);

  updatePresence();

  // Load the slash commands
  const slashCommands = loadSlashCommands(client);

  // Log how many slash commands were found and loaded
  client.logger.log(`Loaded ${slashCommands.length} slash commands.`);

  try {
    // GLOBAL registration (may take up to 1 hour to appear)
    await client.application.commands.set(slashCommands);

    // ALTERNATIVE: Faster for dev/testing (use your dev server ID)
    // await client.guilds.cache.get("1352089320093122561").commands.set(slashCommands); DEV SERVER ONLY

    client.logger.log(`✅ Successfully registered ${slashCommands.length} slash commands.`);
  } catch (error) {
    client.logger.error("❌ Failed to register slash commands:", error);
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.error("Unhandled exception", err));
=======
>>>>>>> 68ea410b (Beta0.6)

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

<<<<<<< HEAD
=======
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.error("Unhandled exception", err));

>>>>>>> 68ea410b (Beta0.6)
// Initialize bot
(async () => {
  await checkForUpdates();

  if (config.DASHBOARD.enabled) {
    client.logger.log("Launching dashboard...");
    try {
      const { launch } = require("@root/dashboard/app");
      await launch(client);
    } catch (err) {
      client.logger.error("Failed to launch dashboard", err);
    }
  } else {
    await initializeMongoose();
  }

  await client.login(process.env.BOT_TOKEN);

<<<<<<< HEAD
  client.once("ready", () => {
    client.logger.log(`Logged in as ${client.user.tag}`);
    updatePresence();
=======
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
>>>>>>> 68ea410b (Beta0.6)
  });
})();
