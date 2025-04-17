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
          name: "🛠️ Fixes and Improvements",
          value:
            "- **Database System**: Switched from MongoDB to a local JSON-based storage system for improved reliability and speed.\n" +
            "- **Economy System**: Refined economy system to read/write from `data.json` with better performance.\n" +
            "- **Schema Logic**: Simplified schema logic to enhance security and maintainability.",
        },
        {
          name: "📌 Upcoming Features",
          value:
            "- **Moderation Tools**: Expanded moderation capabilities, including more customizable bans and warnings.\n" +
            "- **Interactive Dashboards**: A new stats dashboard to track bot performance in real time.\n" +
            "- **Customizable Statuses**: Ability to set your own status messages for the bot.",
        },
        {
          name: "🗄️ Database Changes",
          value:
            "- **Switch to JSON**: Switched from MongoDB to a local JSON file system for faster, simpler, and more secure data access.\n" +
            "- **Reduced External Dependencies**: The bot is now more lightweight with fewer external libraries.",
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
          name: "🛠️ Fixes and Improvements",
          value:
            "- **Database System**: Switched from MongoDB to a local JSON-based storage system for improved reliability and speed.\n" +
            "- **Economy System**: Refined economy system to read/write from `data.json` with better performance.\n" +
            "- **Schema Logic**: Simplified schema logic to enhance security and maintainability.",
        },
        {
          name: "📌 Upcoming Features",
          value:
            "- **Moderation Tools**: Expanded moderation capabilities, including more customizable bans and warnings.\n" +
            "- **Interactive Dashboards**: A new stats dashboard to track bot performance in real time.\n" +
            "- **Customizable Statuses**: Ability to set your own status messages for the bot.",
        },
        {
          name: "🗄️ Database Changes",
          value:
            "- **Switch to JSON**: Switched from MongoDB to a local JSON file system for faster, simpler, and more secure data access.\n" +
            "- **Reduced External Dependencies**: The bot is now more lightweight with fewer external libraries.",
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
