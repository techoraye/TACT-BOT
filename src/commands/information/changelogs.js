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
      .setDescription(`Here are the latest updates and changes:`)
      .addFields(
        {
          name: "🚀 Stable Version",
          value: `Currently running **v${config.STABLE_VERSION}**`,
        },
        {
          name: "🆕 New Additions",
          value: [
            "✅ **Bot name changed** from **TechActivity Bot** to **TACT**",
            "🖼️ **New logo added** featuring a sword in a modern, bold design",
            "🔐 **Owner-only command fixed**: `*potential`"
          ].join("\n"),
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
      .setDescription(`Here are the latest updates and changes:`)
      .addFields(
        {
          name: "🚀 Stable Version",
          value: `Currently running **v${config.STABLE_VERSION}**`,
        },
        {
          name: "🆕 New Additions",
          value: [
            "✅ **Bot name changed** from **TechActivity Bot** to **TACT**",
            "🖼️ **New logo added** featuring a sword in a modern, bold design",
            "🔐 **Owner-only command fixed**: `*potential`"
          ].join("\n"),
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
