const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("@root/config.js");

module.exports = {
  name: "changelogs",
  description: "Displays the latest updates, bug fixes, and new features for the bot.",
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

  // Message command handler (when used with a prefix in a text channel)
  messageRun: async (message) => {
    const typingDelay = Math.floor(Math.random() * 5000) + 1000; // Random typing delay for added realism
    await message.channel.sendTyping(); // Simulate typing
    await new Promise((resolve) => setTimeout(resolve, typingDelay)); // Wait before sending the message

    const changelogEmbed = new EmbedBuilder()
      .setTitle("📢 **Bot Changelogs**")
      .setColor("#FFA500")
      .setDescription(
        "Stay updated with the latest changes, bug fixes, and feature updates for the bot. This changelog will keep you informed about what’s new and what’s coming soon!"
      )
      .addFields(
        {
          name: "🚀 **Stable Version**",
          value: `Currently running **v${config.STABLE_VERSION}**`,
          inline: false,
        },
        {
          name: "🔧 **Recent Updates**",
          value: "• Fixed embed display issues\n• Corrected event triggers\n• Updated dev commands for better functionality\n• Improved error handling\n• Fixed command path issues\n• Improved changelog command for better user experience",
          inline: false,
        },
        {
          name: "🔜 **Coming Soon**",
          value: "• More changelog features and updates to be added soon!\n• Ongoing improvements for better bot performance.",
          inline: false,
        }
      )
      .setFooter({ text: "Stay tuned for more updates!" })
      .setTimestamp();

    // Add a button with a link to the support server
    const supportButton = new ButtonBuilder()
      .setLabel("Join Support Server")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.gg/M7yyGfKdKx");

    const row = new ActionRowBuilder().addComponents(supportButton);

    await message.channel.send({ embeds: [changelogEmbed], components: [row] }); // Send the changelog embed with the support button
  },

  // Slash command handler (when used as a slash command)
  interactionRun: async (interaction) => {
    const typingDelay = Math.floor(Math.random() * 5000) + 1000; // Random typing delay for added realism
    await interaction.channel.sendTyping(); // Simulate typing
    await new Promise((resolve) => setTimeout(resolve, typingDelay)); // Wait before sending the message

    const changelogEmbed = new EmbedBuilder()
      .setTitle("📢 **Bot Changelogs**")
      .setColor("#FFA500")
      .setDescription(
        "Stay updated with the latest changes, bug fixes, and feature updates for the bot. This changelog will keep you informed about what’s new and what’s coming soon!"
      )
      .addFields(
        {
          name: "🚀 **Stable Version**",
          value: `Currently running **v${config.STABLE_VERSION}**`,
          inline: false,
        },
        {
          name: "🔧 **Recent Updates**",
          value: "• Fixed embed display issues\n• Corrected event triggers\n• Updated dev commands for better functionality\n• Improved error handling\n• Fixed command path issues\n• Improved changelog command for better user experience",
          inline: false,
        },
        {
          name: "🔜 **Coming Soon**",
          value: "• More changelog features and updates to be added soon!\n• Ongoing improvements for better bot performance.",
          inline: false,
        }
      )
      .setFooter({ text: "Stay tuned for more updates!" })
      .setTimestamp();

    // Add a button with a link to the support server
    const supportButton = new ButtonBuilder()
      .setLabel("Join Support Server")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.gg/M7yyGfKdKx");

    const row = new ActionRowBuilder().addComponents(supportButton);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [changelogEmbed], components: [row] }); // Send the reply with the changelog embed and the support button
    } else {
      await interaction.followUp({ embeds: [changelogEmbed], ephemeral: true, components: [row] }); // Send a follow-up with the changelog embed and the support button
    }
  },
};
