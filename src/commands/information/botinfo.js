const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("TikTok")
        .setStyle(ButtonStyle.Link)
        .setURL("https://www.tiktok.com/@techtact"),
      new ButtonBuilder()
        .setLabel("GitHub Repo")
        .setStyle(ButtonStyle.Link)
        .setURL("https://github.com/techarye/TACT-BOT"),
      new ButtonBuilder()
        .setLabel("Hosting")
        .setStyle(ButtonStyle.Link)
        .setURL("https://ngrok.com/")
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  },

  interactionRun: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("🤖 Bot Information")
      .setDescription("Here is some information about the bot.")
      .setColor("#5865F2")
      .addFields(
        {
          name: "👤 Developer",
          value: "[techarye](https://github.com/techarye)",
          inline: true,
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("TikTok")
        .setStyle(ButtonStyle.Link)
        .setURL("https://www.tiktok.com/@techtact"),
      new ButtonBuilder()
        .setLabel("GitHub Repo")
        .setStyle(ButtonStyle.Link)
        .setURL("https://github.com/techarye/TACT-BOT"),
      new ButtonBuilder()
        .setLabel("Hosting")
        .setStyle(ButtonStyle.Link)
        .setURL("https://ngrok.com/")
    );

    // Avoid replying twice
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [embed], components: [row] });
    } else {
      await interaction.followUp({ embeds: [embed], components: [row], ephemeral: true });
    }
  },
};
