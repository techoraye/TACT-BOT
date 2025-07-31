const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { OWNER_IDS } = require("../../../config.js");

let replyCache = new Map();

module.exports = {
  name: "commandpath",
  description: "Get the full file path of a command by name.",
  category: "OWNER",
  botPermissions: ["SendMessages"],
  command: {
    enabled: true,
    aliases: ["cmdpath", "getpath"],
    usage: "<command_name>",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    if (replyCache.has(message.id)) return;

    if (!OWNER_IDS.includes(message.author.id)) {
      replyCache.set(message.id, true);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("⛔ Access Denied")
            .setDescription("You don't have permission to use this command."),
        ],
      });
    }

    const commandName = args[0]?.toLowerCase();
    if (!commandName) {
      replyCache.set(message.id, true);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("❓ Missing Argument")
            .setDescription("Please provide a command name. Example: `help`, `ping`, `ban`."),
        ],
      });
    }

    const baseDir = path.resolve(__dirname, ".."); // starts in /commands/
    let foundPath = null;

    function searchCommandFile(dir) {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const itemPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          searchCommandFile(itemPath);
        } else if (item.name === `${commandName}.js`) {
          foundPath = itemPath;
          break;
        }
      }
    }

    searchCommandFile(baseDir);

    replyCache.set(message.id, true);
    if (!foundPath) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Command Not Found")
            .setDescription(`No file found for command: \`${commandName}\`.`),
        ],
      });
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle("📂 Command File Found")
          .setDescription(`\`\`\`${foundPath}\`\`\``)
          .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() }),
      ],
    });
  },
};
