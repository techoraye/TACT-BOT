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
          name: "📌 Upcoming Features",
          value:
            "- **Moderation Tools**: Expanded moderation capabilities, including more customizable bans and warnings.\n" +
            "- **Interactive Dashboards**: A new stats dashboard to track bot performance in real time.\n" +
            "- **Customizable Statuses**: Ability to set your own status messages for the bot.",
        },
        {
          name: "⚙️ New Feature: Auto-Leave System",
          value:
            "- **Auto-Leave**: The bot will now automatically leave inactive servers after 2 weeks of no interaction. A warning will be sent 1 day before leaving to allow server owners to engage the bot and prevent leaving.\n" +
            "- **Time-based Leave**: The bot checks server activity every 30 minutes and leaves servers with no activity for 14 days.",
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
          name: "📌 Upcoming Features",
          value:
            "- **Moderation Tools**: Expanded moderation capabilities, including more customizable bans and warnings.\n" +
            "- **Interactive Dashboards**: A new stats dashboard to track bot performance in real time.\n" +
            "- **Customizable Statuses**: Ability to set your own status messages for the bot.",
        },
        {
          name: "⚙️ New Feature: Auto-Leave System",
          value:
            "- **Auto-Leave**: The bot will now automatically leave inactive servers after 2 weeks of no interaction. A warning will be sent 1 day before leaving to allow server owners to engage the bot and prevent leaving.\n" +
            "- **Time-based Leave**: The bot checks server activity every 30 minutes and leaves servers with no activity for 14 days.",
        }
      )
      .setFooter({ text: "Stay updated with the latest changes!" })
      .setTimestamp();

    // Prevent multiple replies to the interaction
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  },
};
