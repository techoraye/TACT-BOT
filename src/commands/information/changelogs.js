const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const config = require("@root/config.js");

module.exports = {
  name: "changelogs",
  description: "Displays the latest bot updates, new features, and upcoming changes.",
  cooldown: 5,
  isPremium: false,
  category: "INFORMATION",
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["updates", "news"],
    usage: "/changelogs",
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },

  messageRun: async (message) => {
    await simulateTyping(message.channel);
    const embed = createChangelogEmbed(config.STABLE_VERSION);
    const row = createSupportRow();
    await message.channel.send({ embeds: [embed], components: [row] });
  },

  interactionRun: async (interaction) => {
    await simulateTyping(interaction.channel);
    const embed = createChangelogEmbed(config.STABLE_VERSION);
    const row = createSupportRow();

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [embed], components: [row] });
    } else {
      await interaction.followUp({ embeds: [embed], ephemeral: true, components: [row] });
    }
  },
};

function createChangelogEmbed(version) {
  return new EmbedBuilder()
    .setTitle("📢 Bot Changelog")
    .setColor("#F59E0B") // amber-500
    .setDescription("Here are the latest improvements, new features, and upcoming plans for the bot.")
    .addFields(
      {
        name: "🚀 Latest Version",
        value: `**v${version}**`,
      },
      {
        name: "✨ New Features",
        value: [
          "• `/pay` command added — allows users to send coins to each other.",
        ].join("\n"),
      },
      {
        name: "🐛 Bug Fixes",
        value: [
          "• Fixed `/wikipedia` command errors.",
          "• Cleaned up GitHub update logs in the console.",
        ].join("\n"),
      },
      {
        name: "🔧 Changes",
        value: "• Temporarily removed `embed/say` command (will return after a full rewrite).",
      },
      {
        name: "🔜 Coming Soon",
        value: [
          "**`/presence` Command (Owner Only)**",
          "• Manage bot activity/status (add, edit, remove, list).",
          "",
          "**Mod Inbox via DMs**",
          "• Users can DM the bot to reach out to server staff privately.",
        ].join("\n"),
      }
    )
    .setFooter({ text: "More updates coming soon!" })
    .setTimestamp();
}

function createSupportRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Join Support Server")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.gg/M7yyGfKdKx")
  );
}

async function simulateTyping(channel) {
  const delay = Math.floor(Math.random() * 3000) + 1000;
  await channel.sendTyping();
  await new Promise((res) => setTimeout(res, delay));
}
