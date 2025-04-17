const { EmbedBuilder } = require("discord.js");
const config = require("@root/config.js");

module.exports = {
  name: "changelogs",
  description: "Displays the latest updates and changes for the bot.",
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
      .setTitle("📢 **Bot Changelogs**")
      .setColor("#FFA500")
      .setDescription("Check out the latest updates and features for the bot:")
      .addFields(
        {
          name: "📌 **What's Coming**",
          value:
            "- Enhanced moderation tools\n" +
            "- Customizable status messages\n" +
            "- Interactive dashboards and statistics tracking\n" +
            "- Surprise",
        },
        {
          name: "🚀 **Beta Version**",
          value: `The bot is currently running **v${config.BETA_VERSION}**`,
        },
        {
          name: "🗄️ **Database Changes**",
          value:
            "- Switched from MongoDB to a local JSON file system for storing economy data\n" +
            "- Updated database schema to handle user balances and transactions more efficiently\n" +
            "- Refined data retrieval functions to optimize response times\n" +
            "- Improved error handling and data integrity checks for better stability\n" +
            "- Now on local computer",
        }
      )
      .setFooter({ text: "Stay updated with the latest features!" })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("📢 **Bot Changelogs**")
      .setColor("#FFA500")
      .setDescription("Here are the latest updates and features:")
      .addFields(
        {
          name: "📌 **What's Coming**",
          value:
            "- Enhanced moderation tools\n" +
            "- Customizable status messages\n" +
            "- Interactive dashboards and statistics tracking\n" +
            "- Surprise",
        },
        {
          name: "🚀 **Beta Version**",
          value: `The bot is currently running **v${config.BETA_VERSION}**`,
        },
        {
          name: "🗄️ **Database Changes**",
          value:
            "- Switched from MongoDB to a local JSON file system for storing economy data\n" +
            "- Updated database schema to handle user balances and transactions more efficiently\n" +
            "- Refined data retrieval functions to optimize response times\n" +
            "- Improved error handling and data integrity checks for better stability\n" +
            "- Now on local computer",
        }
      )
      .setFooter({ text: "Stay updated with the latest features!" })
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
