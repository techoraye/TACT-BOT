const { CommandCategory } = require("@src/structures");
const { EMBED_COLORS, SUPPORT_SERVER, INVITE_URL } = require("@root/config.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
} = require("discord.js");
const { getCommandUsage, getSlashUsage } = require("@handlers/command");

const CMDS_PER_PAGE = 6;
const IDLE_TIMEOUT = 120;

module.exports = {
  name: "help",
  description: "✨ Browse all bot commands and categories in a modern, interactive menu.",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[command]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "command",
        description: "Name of the command",
        required: false,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "category",
        description: "Specific command category",
        required: false,
        type: ApplicationCommandOptionType.String,
        choices: Object.entries(CommandCategory).map(([key, category]) => ({
          name: category.name,
          value: key,
        })),
      },
    ],
  },

  async messageRun(message, args, data) {
    const trigger = args[0];
    const category = args[1];

    if (!trigger && !category) {
      const response = await getHelpMenu(message);
      const sentMsg = await message.safeReply(response);
      return waiter(sentMsg, message.author.id, data.prefix, response.embeds);
    }

    if (category) {
      return getCategoryHelp(message, category, data.prefix);
    }

    const cmd = message.client.getCommand(trigger);
    if (cmd) {
      const embed = getCommandUsage(cmd, data.prefix, trigger);
      return message.safeReply({ embeds: [embed] });
    }

    await message.safeReply("No matching command found.");
  },

  async interactionRun(interaction) {
    const cmdName = interaction.options.getString("command");
    const categoryName = interaction.options.getString("category");

    if (!cmdName && !categoryName) {
      const response = await getHelpMenu(interaction);
      const sentMsg = await interaction.followUp(response);
      return waiter(sentMsg, interaction.user.id, undefined, response.embeds);
    }

    if (categoryName) {
      return getCategoryHelp(interaction, categoryName);
    }

    const cmd = interaction.client.slashCommands.get(cmdName);
    if (cmd) {
      const embed = getSlashUsage(cmd);
      return interaction.followUp({ embeds: [embed] });
    }

    await interaction.followUp("No matching command found.");
  },
};

async function getHelpMenu({ client, guild }) {
  const options = [
    {
      label: "🏠 Home",
      value: "HOME",
      description: "Return to the main help menu",
      emoji: "🏠",
    },
    ...Object.entries(CommandCategory)
      .filter(([, v]) => v.enabled !== false)
      .map(([k, v]) => ({
        label: v.emoji ? `${v.emoji} ${v.name}` : v.name,
        value: k,
        description: `View commands in ${v.name} category`,
        emoji: v.emoji || undefined,
      })),
  ];

  const menuRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("help-menu")
      .setPlaceholder("📚 Select a command category")
      .addOptions(options)
  );

  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("previousBtn").setEmoji("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(true),
    new ButtonBuilder().setCustomId("nextBtn").setEmoji("➡️").setStyle(ButtonStyle.Secondary).setDisabled(true)
  );

  const linkRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🤖 Invite Me")
      .setStyle(ButtonStyle.Link)
      .setEmoji("➕")
      .setURL(INVITE_URL),
    new ButtonBuilder()
      .setLabel("🌐 Support Server")
      .setStyle(ButtonStyle.Link)
      .setEmoji("🛠️")
      .setURL(SUPPORT_SERVER)
  );

  const embed = getHomeEmbed(client, guild);

  return {
    embeds: [embed],
    components: [menuRow, navRow, linkRow],
  };
}

function getHomeEmbed(client, guild) {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setTitle("✨ TACT Interactive Help Menu")
    .setDescription([
      `Welcome to **${guild.members.me.displayName}**'s help menu!`,
      "",
      "🔹 **Browse categories** using the menu below.",
      "🔹 **Use `/help <command>`** for detailed command info.",
      "",
      "Need more help? Use the buttons below to invite the bot or join our support server!"
    ].join("\n"))
    .setFooter({ text: "Select a category to get started • Powered by TACT Team" });
}

async function getCategoryHelp(ctx, category, prefix) {
  const categoryData = CommandCategory[category.toUpperCase()];
  if (!categoryData) {
    if (ctx.safeReply) return ctx.safeReply("❌ No such category found!");
    return ctx.followUp("❌ No such category found!");
  }

  const embeds = getCategoryEmbeds(ctx.client, category.toUpperCase(), prefix);

  // Build the same menu, nav, and link rows as in getHelpMenu
  const options = Object.entries(CommandCategory)
    .filter(([, v]) => v.enabled !== false)
    .map(([k, v]) => ({
      label: v.emoji ? `${v.emoji} ${v.name}` : v.name,
      value: k,
      description: `View commands in ${v.name} category`,
      emoji: v.emoji || undefined,
    }));

  const menuRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("help-menu")
      .setPlaceholder("📚 Select a command category")
      .addOptions(options)
  );

  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("previousBtn").setEmoji("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(embeds.length <= 1),
    new ButtonBuilder().setCustomId("nextBtn").setEmoji("➡️").setStyle(ButtonStyle.Secondary).setDisabled(embeds.length <= 1)
  );

  const linkRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🤖 Invite Me")
      .setStyle(ButtonStyle.Link)
      .setEmoji("➕")
      .setURL(INVITE_URL),
    new ButtonBuilder()
      .setLabel("🌐 Support Server")
      .setStyle(ButtonStyle.Link)
      .setEmoji("🛠️")
      .setURL(SUPPORT_SERVER)
  );

  // Send the first page and start the waiter for navigation
  if (ctx.safeReply) {
    const sentMsg = await ctx.safeReply({ embeds: [embeds[0]], components: [menuRow, navRow, linkRow] });
    return waiter(sentMsg, ctx.author.id, prefix, embeds);
  } else {
    const sentMsg = await ctx.followUp({ embeds: [embeds[0]], components: [menuRow, navRow, linkRow] });
    return waiter(sentMsg, ctx.user.id, prefix, embeds);
  }
}

function waiter(msg, userId, prefix, initialEmbeds = []) {
  let arrEmbeds = initialEmbeds && initialEmbeds.length > 0
    ? initialEmbeds
    : [msg.embeds[0]];
  let currentPage = 0;
  let menuRow = msg.components[0];
  let navRow = msg.components[1];

  const client = msg.client;
  const guild = msg.guild;

  const collector = msg.channel.createMessageComponentCollector({
    filter: (i) => i.user.id === userId && i.message.id === msg.id,
    idle: IDLE_TIMEOUT * 1000,
    dispose: true,
    time: 5 * 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    await interaction.deferUpdate();
    const id = interaction.customId;

    if (id === "help-menu") {
      const cat = interaction.values[0].toUpperCase();
      if (cat === "HOME") {
        const embed = getHomeEmbed(client, guild);
        arrEmbeds = [embed];
        currentPage = 0;
        // Disable nav buttons on home
        const updatedButtons = navRow.components.map((btn) =>
          ButtonBuilder.from(btn).setDisabled(true)
        );
        navRow = new ActionRowBuilder().addComponents(updatedButtons);
        return msg.edit({ embeds: [embed], components: [menuRow, navRow, msg.components[2]] });
      }
      arrEmbeds = prefix
        ? getCategoryEmbeds(client, cat, prefix)
        : getSlashCategoryEmbeds(client, cat);
      currentPage = 0;

      const updatedButtons = navRow.components.map((btn) =>
        ButtonBuilder.from(btn).setDisabled(arrEmbeds.length <= 1)
      );
      navRow = new ActionRowBuilder().addComponents(updatedButtons);
      return msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, navRow, msg.components[2]] });
    }

    if (id === "previousBtn" && currentPage > 0) {
      currentPage--;
    } else if (id === "nextBtn" && currentPage < arrEmbeds.length - 1) {
      currentPage++;
    }

    return msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, navRow, msg.components[2]] });
  });

  collector.on("end", () => {
    if (msg.editable) {
      msg.edit({ components: [] }).catch(() => {});
    }
  });
}

function getSlashCategoryEmbeds(client, category) {
  const commands = Array.from(client.slashCommands.filter((cmd) => cmd.category === category).values());

  const embedDesc = (commands) => {
    return commands
      .map((cmd) => `\`/${cmd.name}\`\n> ${cmd.description}\n`)
      .join("\n");
  };

  if (category === "IMAGE") {
    let desc = embedDesc(commands);

    const filters = client.slashCommands.get("filter")?.slashCommand?.options?.[0]?.choices ?? [];
    const gens = client.slashCommands.get("generator")?.slashCommand?.options?.[0]?.choices ?? [];

    desc += `\n**Available Filters:** ${filters.map((c) => c.name).join(", ")}\n`;
    desc += `**Available Generators:** ${gens.map((c) => c.name).join(", ")}`;

    return [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(CommandCategory[category]?.image)
        .setAuthor({ name: `${category} Commands` })
        .setDescription(desc),
    ];
  }

  if (commands.length === 0) {
    return [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(CommandCategory[category]?.image)
        .setAuthor({ name: `${category} Commands` })
        .setDescription("No commands in this category."),
    ];
  }

  return paginate(commands, category);
}

function getCategoryEmbeds(client, category, prefix) {
  const commands = client.commands.filter((cmd) => cmd.category === category);

  if (commands.length === 0) {
    return [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(CommandCategory[category]?.image)
        .setAuthor({ name: `${CommandCategory[category]?.emoji || ""} ${category} Commands` })
        .setDescription("No commands in this category."),
    ];
  }

  const pages = [];
  for (let i = 0; i < commands.length; i += CMDS_PER_PAGE) {
    const chunk = commands.slice(i, i + CMDS_PER_PAGE);
    const desc = chunk
      .map((cmd) => {
        const subCmds = cmd.slashCommand?.options?.filter(
          (o) => o.type === ApplicationCommandOptionType.Subcommand
        );
        return [
          `### \`${cmd.name}\``,
          `> **Usage:** \`${prefix}${cmd.name}\``,
          `> **Description:** ${cmd.description}`,
          subCmds?.length ? `> **Subcommands:** ${subCmds.map((s) => `\`${s.name}\``).join(", ")}` : "",
        ].filter(Boolean).join("\n");
      })
      .join("\n"); // Only one line break between commands

    pages.push(
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(CommandCategory[category]?.image)
        .setAuthor({ name: `${CommandCategory[category]?.emoji || ""} ${category} Commands` })
        .setDescription(desc)
        .setFooter({ text: `Page ${Math.floor(i / CMDS_PER_PAGE) + 1} of ${Math.ceil(commands.length / CMDS_PER_PAGE)}` })
    );
  }

  return pages;
}

function paginate(commands, category, prefix) {
  const pages = [];
  for (let i = 0; i < commands.length; i += CMDS_PER_PAGE) {
    const chunk = commands.slice(i, i + CMDS_PER_PAGE);
    const desc = chunk
      .map((cmd) => {
        const subCmds = cmd.slashCommand?.options?.filter(
          (o) => o.type === ApplicationCommandOptionType.Subcommand
        );
        return `\`/${cmd.name}\`\n> **Description:** ${cmd.description}\n${
          subCmds?.length ? `> **Subcommands:** ${subCmds.map((s) => s.name).join(", ")}\n` : ""
        }`;
      })
      .join("\n");

    pages.push(
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(CommandCategory[category]?.image)
        .setAuthor({ name: `${category} Commands` })
        .setDescription(desc)
        .setFooter({ text: `Page ${Math.floor(i / CMDS_PER_PAGE) + 1} of ${Math.ceil(commands.length / CMDS_PER_PAGE)}` })
    );
  }

  return pages;
}