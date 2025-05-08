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

        if (OWNER_IDS.includes(targetId)) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Orange")
                .setTitle("⚠ Already Added")
                .setDescription(`<@${targetId}> (ID: ${targetId}) is already in the DEV list.`),
            ],
            allowedMentions: { users: [] },
          });
        }

        OWNER_IDS.push(targetId);
        updateConfig();

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setTitle("✅ Developer Added")
              .setDescription(`<@${targetId}> (ID: ${targetId}) was added to the DEV list.`),
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
                .setDescription(`<@${targetId}> (ID: ${targetId}) is not in the DEV list.`),
            ],
            allowedMentions: { users: [] },
          });
        }

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

        OWNER_IDS.splice(index, 1);
        updateConfig();

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setTitle("🗑️ Developer Removed")
              .setDescription(`<@${targetId}> (ID: ${targetId}) was removed from the DEV list.`),
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

        const lines = OWNER_IDS.map((id, i) => `\`${i + 1}.\` <@${id}> (ID: ${id})`);

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
  const config = require(configPath); // Import config file

  // Update OWNER_IDS while preserving other properties
  config.OWNER_IDS = OWNER_IDS;

  // Convert the config object to a string with proper indentation, without adding quotes to other variables
  const content = `module.exports = {
  OWNER_IDS: ${JSON.stringify(OWNER_IDS, null, 2)},  // Owner IDs
  LOG_CHANNEL_ID: "${config.LOG_CHANNEL_ID}",
  SUPPORT_SERVER: "${config.SUPPORT_SERVER}",
  INVITE_URL: "${config.INVITE_URL}",
  STABLE_VERSION: "${config.STABLE_VERSION}",
  PREFIX_COMMANDS: ${JSON.stringify(config.PREFIX_COMMANDS, null, 2)},
  INTERACTIONS: ${JSON.stringify(config.INTERACTIONS, null, 2)},
  EMBED_COLORS: ${JSON.stringify(config.EMBED_COLORS, null, 2)},
  CACHE_SIZE: ${JSON.stringify(config.CACHE_SIZE, null, 2)},
  MESSAGES: ${JSON.stringify(config.MESSAGES, null, 2)},
  ECONOMY: ${JSON.stringify(config.ECONOMY, null, 2)},
  UTILITY: ${JSON.stringify(config.UTILITY, null, 2)},
  IMAGE: ${JSON.stringify(config.IMAGE, null, 2)},
  INVITE: ${JSON.stringify(config.INVITE, null, 2)},
  MODERATION: ${JSON.stringify(config.MODERATION, null, 2)},
  AUTOMOD: ${JSON.stringify(config.AUTOMOD, null, 2)},
  PRESENCE: ${JSON.stringify(config.PRESENCE, null, 2)},
  TICKET: ${JSON.stringify(config.TICKET, null, 2)},
};`;

  // Write the updated content back to the config file
  fs.writeFileSync(configPath, content, "utf8");
}
