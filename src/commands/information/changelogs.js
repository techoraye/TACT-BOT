const { EmbedBuilder } = require("discord.js");
const config = require("@root/config.js");

module.exports = {
  name: "changelogs",
  description: "Shows the latest bot updates and changes",
  cooldown: 5,
  isPremium: false,
  category: "INFORMATION",
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: [],
  validations: [],
  command: {
    enabled: true,
    aliases: ["updates", "news"],
    usage: "/changelogs",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },

  messageRun: async (message) => {
    const typingDelay = Math.floor(Math.random() * 5000) + 1000;
    await message.channel.sendTyping();
    await new Promise((resolve) => setTimeout(resolve, typingDelay));

    const embed = new EmbedBuilder()
      .setTitle("📢 Bot Changelogs")
      .setColor("#FFA500")
      .setDescription(`Stay updated with the latest changes and improvements to the bot.`)
      .addFields(
        {
          name: "🚀 Stable Version",
          value: `Currently running **v${config.STABLE_VERSION}**`,
        },
        {
          name: "🆕 New Additions",
          value: [
            "• **Counting System**: Global counting using a local database.",
            "• **Command Refactor**: Split functions into `/functions` and added some subcommands under `/sub/`.",
            "• **Owner Commands**: `setversion`, `dev`, `commandpath`, `listinvites`.",
            "• **Presence Handling**: Moved animated presence to root functions.",
            "• **Wikipedia Fix**: Fixed and improved intelligent reply."
          ].join("\n"),
        },
        {
          name: "🔜 Coming Soon",
          value: "• `presence` command to add, remove, edit, and list presence options.",
        }
      )
      .setFooter({ text: "Stay updated with the latest changes!" })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    const typingDelay = Math.floor(Math.random() * 5000) + 1000;
    await interaction.channel.sendTyping();
    await new Promise((resolve) => setTimeout(resolve, typingDelay));

    const embed = new EmbedBuilder()
      .setTitle("📢 Bot Changelogs")
      .setColor("#FFA500")
      .setDescription(`Stay updated with the latest changes and improvements to the bot.`)
      .addFields(
        {
          name: "🚀 Stable Version",
          value: `Currently running **v${config.STABLE_VERSION}**`,
        },
        {
          name: "🆕 New Additions",
          value: [
            "• **Counting System**: Global counting using a local database.",
            "• **Command Refactor**: Split functions into `/functions` and added some subcommands under `/sub/`.",
            "• **Owner Commands**: `setversion`, `dev`, `commandpath`, `listinvites`.",
            "• **Presence Handling**: Moved animated presence to root functions.",
            "• **Wikipedia Fix**: Fixed and improved intelligent reply."
          ].join("\n"),
        },
        {
          name: "🔜 Coming Soon",
          value: "• `presence` command to add, remove, edit, and list presence options.",
        }
      )
      .setFooter({ text: "Stay updated with the latest changes!" })
      .setTimestamp();

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  },
};
