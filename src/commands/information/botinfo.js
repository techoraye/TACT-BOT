const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "botinfo",
  description: "Displays information about the bot, hosting, and developer.",
  cooldown: 5,
  isPremium: false,
  category: "INFORMATION",
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: [],
  validations: [],
  command: {
    enabled: true,
    aliases: ["credits"],
    usage: "/botinfo",
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
      .setTitle("🤖 TechActivityBot Information")
      .setColor("#7289DA")
      .setDescription("Here's everything you need to know about this bot!")
      .addFields(
        {
          name: "👨‍💻 Developer",
          value: "[techarye](https://github.com/techarye)",
          inline: true,
        },
        {
          name: "📂 GitHub Repository",
          value: "[techactivitybot](https://github.com/techarye/techactivitybot)",
          inline: true,
        },
        {
          name: "🖥️ Hosting",
          value: "[bot-hosting.net](http://bot-hosting.net/)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("🤖 TechActivityBot Information")
      .setColor("#7289DA")
      .setDescription("Here's everything you need to know about this bot!")
      .addFields(
        {
          name: "👨‍💻 Developer",
          value: "[techarye](https://github.com/techarye)",
          inline: true,
        },
        {
          name: "📂 GitHub Repository",
          value: "[techactivitybot](https://github.com/techarye/techactivitybot)",
          inline: true,
        },
        {
          name: "🖥️ Hosting",
          value: "[bot-hosting.net](http://bot-hosting.net/)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
