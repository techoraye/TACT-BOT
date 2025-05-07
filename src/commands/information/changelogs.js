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
    // Simulate typing indicator with random delay (1 to 5 seconds)
    const typingDelay = Math.floor(Math.random() * 5000) + 1000; // Delay between 1 and 5 seconds
    await message.channel.sendTyping();
    await new Promise((resolve) => setTimeout(resolve, typingDelay));

    const embed = new EmbedBuilder()
      .setTitle("📢 Bot Changelogs")
      .setColor("#FFA500")
      .setDescription(`Here are the latest updates and changes:`)
      .addFields(
        {
          name: "🚀 Stable Version",
          value: `Currently running **v${config.STABLE_VERSION}**`,
        },
        {
          name: "🔧 Enhancements",
          value: 
            "1. **Detailed Server Metrics**: Added more in-depth server information such as creation date, bot join date, and active member count.\n" +
            "2. **Success Potential Breakdown**: Explained how the success potential is calculated and its correlation with average server size.\n" +
            "3. **Estimated Growth**: Added growth estimation based on current metrics, providing a forecast of the bot's trajectory.\n" +
            "4. **Bot Engagement Data**: Enhanced server-level data with engagement rates, reflecting member activity.\n" +
            "5. **Bot Permission Management**: Added functionality to assign bot permissions to channels dynamically.\n" +
            "6. **Server Join Tracking**: Added logs for when the bot joins a server, including member count and the bot's join time.\n",
        },
        {
          name: "🔨 Fixes & Improvements",
          value: 
            "1. Fixed issues with data pagination and display formatting in large guilds.\n" +
            "2. Updated the bot's success potential calculation method to reflect more accurate growth predictions.\n" +
            "3. Added better handling for inactive or low-engagement servers.\n" +
            "4. Improved server data caching and error handling.\n" +
            "5. Fixed bot's ability to detect valid text channels in certain servers.\n" +
            "6. Added more detailed logs for server join activities and channel permission issues.\n",
        },
        {
          name: "⚙️ Command Changes",
          value: 
            "1. Added the `/clear` command for deleting messages.\n" +
            "2. Updated `/clear` to now work exclusively through slash commands, with enhanced error handling.\n" +
            "3. Fixed issues with `!clear` command not functioning as expected in certain cases.\n" +
            "4. Optimized pagination system for better performance in large servers.\n" +
            "5. Fixed the behavior of the bot on joining new servers, now logging more data on server join events.\n",
        },
        {
          name: "🔧 Fixes & Removals",
          value: 
            "We fixed a lot of commands and removed several outdated features. All major bugs are now resolved, and the bot is running more smoothly than ever. Enjoy a seamless experience with minimal interruptions!",
        }
      )
      .setFooter({ text: "Stay updated with the latest changes!" })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    // Simulate typing indicator with random delay (1 to 5 seconds)
    const typingDelay = Math.floor(Math.random() * 5000) + 1000; // Delay between 1 and 5 seconds
    await interaction.channel.sendTyping();
    await new Promise((resolve) => setTimeout(resolve, typingDelay));

    const embed = new EmbedBuilder()
      .setTitle("📢 Bot Changelogs")
      .setColor("#FFA500")
      .setDescription(`Here are the latest updates and changes:`)
      .addFields(
        {
          name: "🚀 Stable Version",
          value: `Currently running **v${config.STABLE_VERSION}**`,
        },
        {
          name: "🔧 Enhancements",
          value: 
            "1. **Detailed Server Metrics**: Added more in-depth server information such as creation date, bot join date, and active member count.\n" +
            "2. **Success Potential Breakdown**: Explained how the success potential is calculated and its correlation with average server size.\n" +
            "3. **Estimated Growth**: Added growth estimation based on current metrics, providing a forecast of the bot's trajectory.\n" +
            "4. **Bot Engagement Data**: Enhanced server-level data with engagement rates, reflecting member activity.\n" +
            "5. **Bot Permission Management**: Added functionality to assign bot permissions to channels dynamically.\n" +
            "6. **Server Join Tracking**: Added logs for when the bot joins a server, including member count and the bot's join time.\n",
        },
        {
          name: "🔨 Fixes & Improvements",
          value: 
            "1. Fixed issues with data pagination and display formatting in large guilds.\n" +
            "2. Updated the bot's success potential calculation method to reflect more accurate growth predictions.\n" +
            "3. Added better handling for inactive or low-engagement servers.\n" +
            "4. Improved server data caching and error handling.\n" +
            "5. Fixed bot's ability to detect valid text channels in certain servers.\n" +
            "6. Added more detailed logs for server join activities and channel permission issues.\n",
        },
        {
          name: "⚙️ Command Changes",
          value: 
            "1. Added the `/clear` command for deleting messages.\n" +
            "2. Updated `/clear` to now work exclusively through slash commands, with enhanced error handling.\n" +
            "3. Fixed issues with `!clear` command not functioning as expected in certain cases.\n" +
            "4. Optimized pagination system for better performance in large servers.\n" +
            "5. Fixed the behavior of the bot on joining new servers, now logging more data on server join events.\n",
        },
        {
          name: "🔧 Fixes & Removals",
          value: 
            "We fixed a lot of commands and removed several outdated features. All major bugs are now resolved, and the bot is running more smoothly than ever. Enjoy a seamless experience with minimal interruptions!",
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
