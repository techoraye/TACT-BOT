const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { OWNER_IDS } = require("../../../config.js");

// Path to config.js (update according to your file structure)
const configPath = path.resolve(__dirname, "../../../config.js");

module.exports = {
  name: "dev",
  description: "Manage DEV IDs (only accessible to OWNERS).",
  category: "OWNER",
  botPermissions: ["SendMessages"],

  command: {
    enabled: true,
    aliases: ["devs"],
    usage: "<add/remove/list> <user_id>",
  },

  async messageRun(message, args) {
    const userId = message.author.id;

    // Check if the user is an owner
    if (!OWNER_IDS.includes(userId)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("⛔ Access Denied")
            .setDescription("Only bot owners can use this command."),
        ],
      });
    }

    const operation = args[0]?.toLowerCase();
    const targetId = args[1];

    switch (operation) {
      case "add": {
        if (!targetId) return sendUsage(message);

        // Check if the user is already in the dev list
        if (OWNER_IDS.includes(targetId)) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Orange")
                .setTitle("⚠ Already Added")
                .setDescription(`${targetId} (ID: ${targetId}) is already in the DEV list.`),
            ],
            allowedMentions: { users: [] },
          });
        }

        OWNER_IDS.push(targetId); // Add the user to the dev list
        updateConfig(); // Update config.js with the new OWNER_IDS

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setTitle("✅ Developer Added")
              .setDescription(`${targetId} (ID: ${targetId}) was added to the DEV list.`),
          ],
          allowedMentions: { users: [] },
        });
      }

      case "remove": {
        if (!targetId) return sendUsage(message);

        const index = OWNER_IDS.indexOf(targetId);
        if (index === -1) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Not Found")
                .setDescription(`${targetId} (ID: ${targetId}) is not in the DEV list.`),
            ],
            allowedMentions: { users: [] },
          });
        }

        // Prevent removal if only one owner remains
        if (OWNER_IDS.length <= 1) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Cannot Remove")
                .setDescription("At least one developer must remain in the list."),
            ],
            allowedMentions: { users: [] },
          });
        }

        OWNER_IDS.splice(index, 1); // Remove the user from the dev list
        updateConfig(); // Update config.js with the new OWNER_IDS

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setTitle("🗑️ Developer Removed")
              .setDescription(`${targetId} (ID: ${targetId}) was removed from the DEV list.`),
          ],
          allowedMentions: { users: [] },
        });
      }

      case "list": {
        if (OWNER_IDS.length === 0) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Grey")
                .setTitle("📃 Developer List")
                .setDescription("No developers have been added yet."),
            ],
          });
        }

        const lines = OWNER_IDS.map((id, i) => `\`${i + 1}.\` ${id} (ID: ${id})`);

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Blue")
              .setTitle("📃 Developer List")
              .setDescription(lines.join("\n")),
          ],
          allowedMentions: { users: [] },
        });
      }

      default:
        return sendUsage(message);
    }
  },
};

// Function to send usage instructions
function sendUsage(message) {
  return message.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("❓ Missing Arguments")
        .setDescription("Usage: `dev <add/remove/list> <user_id>`"),
    ],
  });
}

// Function to update the config.js with proper formatting and comment preservation
function updateConfig() {
  // Read the config.js file as a string to preserve comments
  const configFile = fs.readFileSync(configPath, "utf8");

  // Replace the OWNER_IDS array with the updated one
  const updatedConfigFile = configFile.replace(
    /OWNER_IDS: \[.*?\],/s, // Regex to find the OWNER_IDS definition
    `OWNER_IDS: ${JSON.stringify(OWNER_IDS, null, 2)},` // Replace with the updated OWNER_IDS
  );

  // Write the updated content back to the config file, preserving comments
  fs.writeFileSync(configPath, updatedConfigFile, "utf8");
}
