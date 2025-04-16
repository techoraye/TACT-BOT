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
          name: "✨ Added",
          value:
            "- `devprofile` command to display GitHub, TikTok, and Discord socials\n" +
            "- `botinfo` command with dev info, repo, and hosting credits",
        },
        {
          name: "🎨 Improvements",
          value:
            "- Cleaner descriptions for embeds\n" +
            "- Structured command format for consistency",
        },
        {
          name: "🆓 Open Source",
          value:
            "The bot is now **open source**! Check it out on [GitHub Repository](https://github.com/techarye/techactivitybot)",
        },
        {
          name: "📌 Coming Soon",
          value:
            "- More moderation features\n" +
            "- Customizable status messages\n" +
            "- Interactive dashboards and stats",
        },
        {
          name: "🚀 Beta Version",
          value: `Currently running **v${config.BETA_VERSION}**`,
        }
      )
      .setFooter({ text: "Stay updated with the latest changes!" })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("📢 Bot Changelogs")
      .setColor("#FFA500")
      .setDescription("Here are the latest updates and changes:")
      .addFields(
        {
          name: "✨ Added",
          value:
            "- `devprofile` command to display GitHub, TikTok, and Discord socials\n" +
            "- `botinfo` command with dev info, repo, and hosting credits",
        },
        {
          name: "🎨 Improvements",
          value:
            "- Cleaner descriptions for embeds\n" +
            "- Structured command format for consistency",
        },
        {
          name: "🆓 Open Source",
          value:
            "The bot is now **open source**! Check it out on [GitHub Repository](https://github.com/techarye/techactivitybot)",
        },
        {
          name: "📌 Coming Soon",
          value:
            "- More moderation features\n" +
            "- Customizable status messages\n" +
            "- Interactive dashboards and stats",
        },
        {
          name: "🚀 Beta Version",
          value: `Currently running **v${config.BETA_VERSION}**`,
        }
      )
      .setFooter({ text: "Stay updated with the latest changes!" })
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
