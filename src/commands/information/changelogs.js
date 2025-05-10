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
            "• **Server Ban System**: Introduced a server blacklist feature (`serverban`) to manage banned servers. Only available to bot owners with commands like `list`, `add`, and `remove`.",
            "• **Bot Introduction Message**: Added a welcome feature for when the bot joins new servers, providing a more engaging introduction.",
            "• **Broadcast Command**: Bot owners can now send messages to all servers using the new `owner` command with a `broadcast` subcommand.",
          ].join("\n"),
        },
        {
          name: "🔧 Fixes & Enhancements",
          value: [
            "• **Help Menu Revamp**: The help menu now displays 7 commands per page, making it easier to navigate.",
            "• **Bot Owner Command Fix**: Resolved an issue with certain bot owner commands causing unexpected behavior.",
            "• **Counting System Fix**: Fixed high score saving to the database and adjusted message handling for new high score notifications. Now it only sends a single notification for new high scores.",
          ].join("\n"),
        },
        {
          name: "🔜 Coming Soon",
          value: "• `presence` command: Manage the bot's presence with options to add, remove, edit, and list active presence settings.",
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
            "• **Server Ban System**: Introduced a server blacklist feature (`serverban`) for bot owners to manage banned servers.",
            "• **Bot Introduction Message**: When the bot joins a server, it now sends a friendly introduction message.",
            "• **Broadcast Command**: Added the `broadcast` command for bot owners to send messages to all servers.",
          ].join("\n"),
        },
        {
          name: "🔧 Fixes & Enhancements",
          value: [
            "• **Help Menu Revamp**: The help menu now displays 7 commands per page for improved navigation.",
            "• **Bot Owner Command Fix**: Fixed an issue that was causing bot owner commands to misbehave.",
            "• **Counting System Fix**: High score saving and notification handling have been fixed. The bot will now notify users of new high scores just once.",
          ].join("\n"),
        },
        {
          name: "🔜 Coming Soon",
          value: "• `presence` command: Add, remove, edit, and list the bot's presence options.",
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
