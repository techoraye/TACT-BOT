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
    usage: "!devprofile",
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

    message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
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

    interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
