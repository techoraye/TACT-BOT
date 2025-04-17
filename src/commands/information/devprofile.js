const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "devprofile",
  description: "Display developer socials.",
  cooldown: 5,
  isPremium: false,
  category: "INFORMATION",
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: [],
  validations: [],
  command: {
    enabled: true,
    aliases: ["socials", "aboutme"],
    usage: "*devprofile",
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
      .setTitle("🌐 Developer Socials")
      .setDescription("Stay connected and check out my online presence across platforms.")
      .setColor("#5865F2")
      .addFields(
        {
          name: "💻 GitHub",
          value: "[github.com/techarye](https://github.com/techarye)",
          inline: true,
        },
        {
          name: "🎵 TikTok",
          value: "[tiktok.com/@techarye](https://www.tiktok.com/@techarye)",
          inline: true,
        },
        {
          name: "🕹️ Discord",
          value: "[techarye](https://discord.com/users/1132413940693995541)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    // Ensure we reply only once
    if (message.replied || message.deferred) {
      return message.followUp({
        content: "It seems the interaction has already been responded to.",
        ephemeral: true,
      });
    }

    message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    // Prevent multiple replies to the interaction
    if (interaction.replied || interaction.deferred) {
      return interaction.followUp({
        content: "It seems the interaction has already been responded to.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🌐 Developer Socials")
      .setDescription("Stay connected and check out my online presence across platforms.")
      .setColor("#5865F2")
      .addFields(
        {
          name: "💻 GitHub",
          value: "[github.com/techarye](https://github.com/techarye)",
          inline: true,
        },
        {
          name: "🎵 TikTok",
          value: "[tiktok.com/@techarye](https://www.tiktok.com/@techarye)",
          inline: true,
        },
        {
          name: "🕹️ Discord",
          value: "[techarye](https://discordapp.com/users/1132413940693995541)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    // Send reply to the interaction
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
