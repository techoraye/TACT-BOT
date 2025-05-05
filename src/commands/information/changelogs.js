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
      .setDescription(`Here are the latest updates and changes:`)
      .addFields(
        {
          name: "🚀 Beta Version",
          value: `Currently running **v${config.BETA_VERSION}**`,
        },
        {
          name: "🛠 Major Enhancements",
          value:
            "• **Presence System Revamp**: Rotating presence with dynamic stats every 20s.\n" +
            "• **Config Validation**: Checks for presence settings before startup.\n" +
            "• **Slash Command Loader**: Auto-registers all slash commands at launch.\n" +
            "• **Improved Startup Sequence**: Clean boot flow with logging.\n" +
            "• **Auto Updater Coming Soon**: One-command update check and implementation from GitHub.",
        },
        {
          name: "🔧 What We Did",
          value:
            "• Optimized the database interaction layer for better performance.\n" +
            "• Refined internal command handling to reduce latency.\n" +
            "• Added detailed logging for presence and slash command loading.\n" +
            "• Improved error handling and feedback for failed interactions.",
        },
        {
          name: "🐞 Bug Fixes",
          value:
            "• Fixed balance not updating correctly in the economy system.\n" +
            "• Resolved embed formatting issues in the ticket system.\n" +
            "• Fixed bot permissions bug blocking command execution.",
        },
        {
          name: "📘 Minor Updates",
          value:
            "• `/changelogs` now shows detailed logs categorized by type.\n" +
            "• Added support for aliases like `/updates` and `/news`.\n" +
            "• Cleaner formatting with emojis and embed design.",
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
      .setDescription(`Here are the latest updates and changes:`)
      .addFields(
        {
          name: "🚀 Beta Version",
          value: `Currently running **v${config.BETA_VERSION}**`,
        },
        {
          name: "🛠 Major Enhancements",
          value:
            "• **Presence System Revamp**: Rotating presence with dynamic stats every 20s.\n" +
            "• **Config Validation**: Checks for presence settings before startup.\n" +
            "• **Slash Command Loader**: Auto-registers all slash commands at launch.\n" +
            "• **Improved Startup Sequence**: Clean boot flow with logging.\n" +
            "• **Auto Updater Coming Soon**: One-command update check and implementation from GitHub.",
        },
        {
          name: "🔧 What We Did",
          value:
            "• Optimized the database interaction layer for better performance.\n" +
            "• Refined internal command handling to reduce latency.\n" +
            "• Added detailed logging for presence and slash command loading.\n" +
            "• Improved error handling and feedback for failed interactions.",
        },
        {
          name: "🐞 Bug Fixes",
          value:
            "• Fixed balance not updating correctly in the economy system.\n" +
            "• Resolved embed formatting issues in the ticket system.\n" +
            "• Fixed bot permissions bug blocking command execution.",
        },
        {
          name: "📘 Minor Updates",
          value:
            "• `/changelogs` now shows detailed logs categorized by type.\n" +
            "• Added support for aliases like `/updates` and `/news`.\n" +
            "• Cleaner formatting with emojis and embed design.",
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
