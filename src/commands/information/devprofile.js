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
          value: "[github.com/techoraye](https://github.com/techoraye)",
          inline: true,
        },
        {
          name: "🎵 TikTok",
          value: "[tiktok.com/@techoraye](https://www.tiktok.com/@techoraye)",
          inline: true,
        },
        {
          name: "🕹️ Discord",
          value: "[techoraye](https://discord.com/users/1132413940693995541)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("🌐 Developer Socials")
      .setDescription("Stay connected and check out my online presence across platforms.")
      .setColor("#5865F2")
      .addFields(
        {
          name: "💻 GitHub",
          value: "[github.com/techoraye](https://github.com/techoraye)",
          inline: true,
        },
        {
          name: "🎵 TikTok",
          value: "[tiktok.com/@techoraye](https://www.tiktok.com/@techoraye)",
          inline: true,
        },
        {
          name: "🕹️ Discord",
          value: "[techoraye](https://discord.com/users/1132413940693995541)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    // Ensure the interaction hasn't been replied to yet
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  },
};
