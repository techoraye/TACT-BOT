const { OWNER_IDS } = require("@root/config");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const path = require("path");
const fs = require("fs");
const { readdirSync } = require("fs");

module.exports = {
  name: "commandpath",
  description: "Get the file path of a specific command",
  category: "OWNER",
  userPermissions: [],
  botPermissions: [],
  owner: true,
  options: [
    {
      name: "command",
      description: "The command name",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  // Removed or converted `slashCommand` to an object if necessary
  slashCommand: {
    enabled: false, // You can add other properties if needed, such as `enabled` for enabling/disabling the slash command
  },

  /**
   * 
   * @param {import('discord.js').ChatInputCommandInteraction} interaction 
   * @param {*} data 
   */
  async interactionRun(interaction, data) {
    const userId = interaction.user.id;
    if (!OWNER_IDS.includes(userId)) {
      return interaction.reply({ content: "❌ Only bot owners can use this command.", ephemeral: true });
    }

    const commandName = interaction.options.getString("command").toLowerCase();
    const commandsPath = path.join(__dirname, ".."); // base command folder
    let filePath = null;

    function findCommandFile(dir) {
      const files = readdirSync(dir, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          findCommandFile(fullPath);
        } else if (file.name === `${commandName}.js`) {
          filePath = fullPath;
          break;
        }
      }
    }

    findCommandFile(commandsPath);

    if (!filePath) {
      return interaction.reply({ content: `❌ Command \`${commandName}\` not found.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle("📂 Command Path Found")
      .setDescription(`\`${commandName}.js\` path:\n\`\`\`${filePath}\`\`\``)
      .setColor("Blue");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
