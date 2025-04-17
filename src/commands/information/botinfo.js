const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "botinfo",
  description: "Displays information about the bot.",
  cooldown: 5,
  isPremium: false,
  category: "INFORMATION",
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: [],
  validations: [],
  command: {
    enabled: true,
    aliases: ["info", "aboutbot"],
    usage: "*botinfo",
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
      .setTitle("🤖 Bot Information")
      .setDescription("Here is some information about the bot.")
      .setColor("#5865F2")
      .addFields(
        {
          name: "👤 Developer",
          value: "[techarye](https://github.com/techarye)",
          inline: true,
        },
        {
          name: "📚 GitHub Repo",
          value: "[techactivitybot](https://github.com/techarye/techactivitybot)",
          inline: true,
        },
        {
          name: "🌍 Hosting",
          value: "[bot-hosting.net](http://bot-hosting.net/)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    if (interaction.replied || interaction.deferred) {
      return interaction.followUp({
        content: "It seems the interaction has already been responded to.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🤖 Bot Information")
      .setDescription("Here is some information about the bot.")
      .setColor("#5865F2")
      .addFields(
        {
          name: "👤 Developer",
          value: "[techarye](https://github.com/techarye)",
          inline: true,
        },
        {
          name: "📚 GitHub Repo",
          value: "[techactivitybot](https://github.com/techarye/techactivitybot)",
          inline: true,
        },
        {
          name: "🌍 Hosting",
          value: "[bot-hosting.net](http://bot-hosting.net/)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
