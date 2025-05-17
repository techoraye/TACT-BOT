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
    const embeds = createChangelogEmbeds(config.STABLE_VERSION, message.client.user.displayAvatarURL());
    const row = createSupportRow();
    const navRow = createNavRow(embeds.length);

    let sentMsg = await message.channel.send({ embeds: [embeds[0]], components: [navRow, row] });
    if (embeds.length > 1) await changelogWaiter(sentMsg, embeds, row);
  },

  interactionRun: async (interaction) => {
    await simulateTyping(interaction.channel);
    const embeds = createChangelogEmbeds(config.STABLE_VERSION, interaction.client.user.displayAvatarURL());
    const row = createSupportRow();
    const navRow = createNavRow(embeds.length);

    let sentMsg;
    if (!interaction.replied && !interaction.deferred) {
      sentMsg = await interaction.reply({ embeds: [embeds[0]], components: [navRow, row], fetchReply: true });
    } else {
      sentMsg = await interaction.followUp({ embeds: [embeds[0]], ephemeral: true, components: [navRow, row], fetchReply: true });
    }
    if (embeds.length > 1) await changelogWaiter(sentMsg, embeds, row);
  },
};

function createChangelogEmbeds(version, botAvatar) {
  const pages = [];

  // Page 1: TACT Changelog (Title, intro, platform support)
  pages.push(
    new EmbedBuilder()
      .setTitle("📢 TACT Changelog")
      .setColor("#F59E0B")
      .setThumbnail(botAvatar)
      .setDescription([
        "Stay informed about the latest updates, features, and fixes. We’re committed to delivering the best experience!",
        "",
        "---",
        "",
        `## 🚀 Stable Release: \`${version}\``,
        "",
        "**Platform Support:**",
        "- Compatible with **Linux**, **Windows**, and **WSL**.",
        "",
        "---",
        "",
        "### ✨ New & Improved",
        "",
        "- **Advanced Ticket System (Admin Only):**",
        "  - Option to set multiple manager roles during setup. These roles will have access to and can manage all tickets.",
        "",
        "---",
        "",
        "## 🔜 Coming Soon",
        "",
        "### 🌐 `/presence` Command *(Bot Owner Only)*",
        "- Manage the bot’s presence:",
        "  - `add`: Set a new status/activity",
        "  - `edit`: Modify an existing one",
        "  - `remove`: Clear current presence",
        "  - `list`: View active settings",
        "",
        "### 📥 Mod Inbox (DM Support)",
        "- Members can DM the bot for:",
        "  - Help requests",
        "  - Reports",
        "  - Private moderation support",
        "",
        "---",
        "",
        "💡 More updates and features are on the way — stay tuned!"
      ].join("\n"))
      .setFooter({ text: "TACT Changelog" })
      .setTimestamp()
  );

  return pages;
}

function createSupportRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🤖 Invite Me")
      .setStyle(ButtonStyle.Link)
      .setEmoji("➕")
      .setURL(config.INVITE_URL),
    new ButtonBuilder()
      .setLabel("🌐 Support Server")
      .setStyle(ButtonStyle.Link)
      .setEmoji("🛠️")
      .setURL("https://discord.gg/M7yyGfKdKx")
  );
}

function createNavRow(pageCount) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("changelog_prev")
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("changelog_next")
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pageCount <= 1)
  );
}

async function changelogWaiter(msg, embeds, supportRow) {
  let currentPage = 0;

  const collector = msg.channel.createMessageComponentCollector({
    filter: (i) =>
      ["changelog_prev", "changelog_next"].includes(i.customId) &&
      i.user.id === (msg.interaction?.user?.id || msg.author?.id),
    idle: 120 * 1000,
    time: 5 * 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    await interaction.deferUpdate();
    if (interaction.customId === "changelog_prev" && currentPage > 0) currentPage--;
    if (interaction.customId === "changelog_next" && currentPage < embeds.length - 1) currentPage++;

    // Update nav buttons
    const updatedNavRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("changelog_prev")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("changelog_next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === embeds.length - 1)
    );

    await msg.edit({ embeds: [embeds[currentPage]], components: [updatedNavRow, supportRow] });
  });

  collector.on("end", () => {
    if (msg.editable) msg.edit({ components: [supportRow] }).catch(() => {});
  });
}

async function simulateTyping(channel) {
  const delay = Math.floor(Math.random() * 1200) + 800;
  await channel.sendTyping();
  await new Promise((res) => setTimeout(res, delay));
}
