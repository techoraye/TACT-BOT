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

  // Page 1: Platform Support
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
      ].join("\n"))
      .setFooter({ text: "Page 1/5 • Platform Support" })
      .setTimestamp()
  );

  // Page 2: New & Improved
  pages.push(
    new EmbedBuilder()
      .setTitle("✨ New & Improved")
      .setColor("#22D3EE")
      .setThumbnail(botAvatar)
      .setDescription([
        "- **/botinfo Command:**",
        "  Expanded details and improved clarity.",
        "",
        "- **Advanced Ticket System (Admin Only):**",
        "  - Fully redesigned setup with interactive modals and buttons.",
        "  - Customizable welcome and creator messages, with live preview/editing.",
        "  - Optional role pings on ticket creation.",
        "  - Set ticket log channels during setup or via command.",
        "  - Limit concurrent open tickets per user.",
        "  - Ticket channels now include action buttons: Close, Transcript, Lock, Pin, Owner.",
        "  - Automatic transcript generation and logging on close.",
        "  - All actions are permission-checked and admin-controlled.",
        "",
        "- **Counting System:**",
        "  - Improved error handling and feedback.",
        "  - Visual cues for correct/incorrect entries.",
      ].join("\n"))
      .setFooter({ text: "Page 2/5 • New & Improved" })
      .setTimestamp()
  );

  // Page 3: Fixes
  pages.push(
    new EmbedBuilder()
      .setTitle("🛠️ Fixes")
      .setColor("#4ADE80")
      .setThumbnail(botAvatar)
      .setDescription([
        "- Resolved permission issues in ticket and counting systems.",
        "- Improved error messages for restricted commands.",
        "- Fixed rare bugs with ticket cleanup and database resets.",
        "- Fixed: Server data is now properly removed from all databases when the bot leaves a guild.",
      ].join("\n"))
      .setFooter({ text: "Page 3/5 • Fixes" })
      .setTimestamp()
  );

  // Page 4: Changes
  pages.push(
    new EmbedBuilder()
      .setTitle("🔄 Changes")
      .setColor("#F472B6")
      .setThumbnail(botAvatar)
      .setDescription([
        "- **Command Cleanup:**",
        "  Removed legacy and unused commands for a streamlined experience.",
        "",
        "- **Owner-Only Commands:**",
        "  Enhanced UI/UX for restricted access, making owner-only commands clearer.",
        "",
        "- **Ticket System:**",
        "  - Simplified admin setup.",
        "  - Added detailed logging and feedback for all ticket actions.",
        "  - Improved database handling for ticket persistence and resets.",
      ].join("\n"))
      .setFooter({ text: "Page 4/5 • Changes" })
      .setTimestamp()
  );

  // Page 5: Coming Soon
  pages.push(
    new EmbedBuilder()
      .setTitle("🔜 Coming Soon")
      .setColor("#FBBF24")
      .setThumbnail(botAvatar)
      .setDescription([
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
      .setFooter({ text: "Page 5/5 • Coming Soon" })
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
