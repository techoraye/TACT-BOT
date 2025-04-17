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
          name: "📌 Coming Soon",
          value:
            "- More moderation features\n" +
            "- Customizable status messages\n" +
            "- Interactive dashboards and stats",
        },
        {
          name: "🚀 Beta Version",
          value: `Currently running **v${config.BETA_VERSION}**`,
        },
        {
          name: "🗄️ Database Changes",
          value:
            "- Switched from MongoDB to a local JSON file system\n" +
            "- Updated economy system to read/write from `data.json`\n" +
            "- Improved performance and reduced external dependencies\n" +
            "- Safer and simpler schema logic using file-based access",
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
          name: "📌 Coming Soon",
          value:
            "- More moderation features\n" +
            "- Customizable status messages\n" +
            "- Interactive dashboards and stats",
        },
        {
          name: "🚀 Beta Version",
          value: `Currently running **v${config.BETA_VERSION}**`,
        },
        {
          name: "🗄️ Database Changes",
          value:
            "- Switched from MongoDB to a local JSON file system\n" +
            "- Updated economy system to read/write from `data.json`\n" +
            "- Improved performance and reduced external dependencies\n" +
            "- Safer and simpler schema logic using file-based access",
        }
      )
      .setFooter({ text: "Stay updated with the latest changes!" })
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
