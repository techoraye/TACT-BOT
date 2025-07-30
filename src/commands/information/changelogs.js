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

  // Page 1: TACT Changelog (Platform Support & Release + Dashboard Beta)
  pages.push(
    new EmbedBuilder()
      .setTitle("📢 TACT Changelog")
      .setColor("#F59E0B")
      .setThumbnail(botAvatar)
      .setDescription([
        "Stay up to date with the latest features, improvements, and fixes for TACT. We're dedicated to delivering the best Discord experience for your community!",
        "",
        "---",
        "",
        `## 🚀 Stable Release: \`${version}\``,
        "",
        "**Platform Support:**",
        "- Fully compatible with **Linux**, **Windows**, and **WSL**.",
        "",
        "### 🖥️ Dashboard (Beta)",
        "- We are excited to introduce the **TACT Dashboard**, now available in beta!",
        "  The dashboard brings a powerful, intuitive web interface for managing your server’s moderation, configuration, and analytics.",
        "  - **Features:**",
        "    - Real-time moderation controls and logs.",
        "    - Effortless role and permission management.",
        "    - Customizable automod and filter settings.",
        "    - Visual analytics for server activity and moderation actions.",
        "    - Secure authentication and granular access controls.",
        "  - **Status:**",
        "    - The dashboard is currently in beta. Some features may be limited or subject to change as we gather feedback and improve stability.",
        "    - We encourage you to try it out and share your feedback to help us shape the final experience!",
      ].join("\n"))
      .setFooter({ text: "Page 1/3 • Platform Support & Dashboard" })
      .setTimestamp()
  );

  // Page 2: Fixes
  pages.push(
    new EmbedBuilder()
      .setTitle("🐞 Fixes")
      .setColor("#22D3EE")
      .setThumbnail(botAvatar)
      .setDescription([
        "- Fixed `/clear` command spamming the Discord API by properly deferring interactions.",
        "- Prevented \"Unknown Message\" errors during message deletions.",
      ].join("\n"))
      .setFooter({ text: "Page 2/3 • Fixes" })
      .setTimestamp()
  );

  // Page 3: Coming Soon
  pages.push(
    new EmbedBuilder()
      .setTitle("🔜 Coming Soon")
      .setColor("#FBBF24")
      .setThumbnail(botAvatar)
      .setDescription([
        "### 📥 Mod Inbox (DM Support)",
        "- Members will soon be able to DM the bot for:",
        "  - Help requests.",
        "  - Reporting issues.",
        "  - Private moderation support.",
        "",
        "### 🤖 AI Integration",
        "- Smarter moderation powered by AI is on its way!",
        "",
        "---",
        "",
        "💡 **Even more updates and features are on the way!**",
        "Thank you for using TACT and being part of our journey to deliver the best Discord experience.",
      ].join("\n"))
      .setFooter({ text: "Page 3/3 • Coming Soon" })
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
