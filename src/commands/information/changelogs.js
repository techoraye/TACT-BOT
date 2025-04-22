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
    const embed = new EmbedBuilder()
      .setTitle("📢 Bot Changelogs")
      .setColor("#FFA500")
      .setDescription("Here are the latest updates and changes:")
      .addFields(
        {
          name: "🚀 Beta Version",
          value: `Currently running **v${config.BETA_VERSION}**`,
        },
        {
          name: "🐞 Fixed",
          value: "• Fixed issue with economy system not updating correctly in certain cases.\n• Fixed minor UI bugs in the ticket system command.\n• Resolved bot permissions issues preventing certain commands from executing properly.",
        },
        {
          name: "🔧 What We Did",
          value: "• Overhauled the database interaction layer for improved performance.\n• Optimized bot commands to reduce response time.\n• Refined user feedback system to provide more helpful error messages."
        }
      )
      .setFooter({ text: "Stay updated with the latest changes!" })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("📢 Bot Changelogs")
      .setColor("#FFA500")
      .setDescription("Here are the latest updates and changes:")
      .addFields(
        {
          name: "🚀 Beta Version",
          value: `Currently running **v${config.BETA_VERSION}**`,
        },
        {
          name: "🐞 Fixed",
          value: "• Fixed issue with economy system not updating correctly in certain cases.\n• Fixed minor UI bugs in the ticket system command.\n• Resolved bot permissions issues preventing certain commands from executing properly.",
        },
        {
          name: "🔧 What We Did",
          value: "• Overhauled the database interaction layer for improved performance.\n• Optimized bot commands to reduce response time.\n• Refined user feedback system to provide more helpful error messages."
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
