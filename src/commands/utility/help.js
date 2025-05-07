const { CommandCategory, BotClient } = require("@src/structures");
const { EMBED_COLORS, SUPPORT_SERVER, INVITE_URL } = require("@root/config.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Message,
  ButtonBuilder,
  CommandInteraction,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const { getCommandUsage, getSlashUsage } = require("@handlers/command");

const CMDS_PER_PAGE = 10;
const IDLE_TIMEOUT = 120;

module.exports = {
  name: "help",
  description: "command help menu",
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
        description: "name of the command",
        required: false,
        type: ApplicationCommandOptionType.String,
      },
    ],
  },

  async messageRun(message, args, data) {
    let trigger = args[0];

    if (!trigger) {
      const response = await getHelpMenu(message);
      const sentMsg = await message.safeReply(response);
      return waiter(sentMsg, message.author.id, data.prefix);
    }

    const cmd = message.client.getCommand(trigger);
    if (cmd) {
      const embed = getCommandUsage(cmd, data.prefix, trigger);
      return message.safeReply({ embeds: [embed] });
    }

    await message.safeReply("No matching command found");
  },

  async interactionRun(interaction) {
    let cmdName = interaction.options.getString("command");

    if (!cmdName) {
      const response = await getHelpMenu(interaction);
      const sentMsg = await interaction.followUp(response);
      return waiter(sentMsg, interaction.user.id);
    }

    const cmd = interaction.client.slashCommands.get(cmdName);
    if (cmd) {
      const embed = getSlashUsage(cmd);
      return interaction.followUp({ embeds: [embed] });
    }

    await interaction.followUp("No matching command found");
  },
};

async function getHelpMenu({ client, guild }) {
  const options = Object.entries(CommandCategory)
    .filter(([, v]) => v.enabled !== false)
    .map(([k, v]) => ({
      label: v.name,
      value: k,
      description: `View commands in ${v.name} category`,
      emoji: v.emoji,
    }));

  const menuRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("help-menu")
      .setPlaceholder("Choose the command category")
      .addOptions(options)
  );

  const buttonsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("previousBtn").setEmoji("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(true),
    new ButtonBuilder().setCustomId("nextBtn").setEmoji("➡️").setStyle(ButtonStyle.Secondary).setDisabled(true)
  );

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setTitle("**Help Command**")
    .setDescription(
      `Hello I am ${guild.members.me.displayName}!\n\n` +
      `**Invite Me:** [Click Here](${INVITE_URL})\n` +
      `**Support Server:** [Join](${SUPPORT_SERVER})`
    );

  return {
    embeds: [embed],
    components: [menuRow, buttonsRow],
  };
}

function waiter(msg, userId, prefix) {
  const collector = msg.channel.createMessageComponentCollector({
    filter: (i) => i.user.id === userId && i.message.id === msg.id,
    idle: IDLE_TIMEOUT * 1000,
    dispose: true,
    time: 5 * 60 * 1000,
  });

  let arrEmbeds = [];
  let currentPage = 0;
  let menuRow = msg.components[0];
  let buttonsRow = msg.components[1];

  collector.on("collect", async (interaction) => {
    await interaction.deferUpdate();
    const id = interaction.customId;

    if (id === "help-menu") {
      const cat = interaction.values[0].toUpperCase();
      arrEmbeds = prefix
        ? getMsgCategoryEmbeds(msg.client, cat, prefix)
        : getSlashCategoryEmbeds(msg.client, cat);
      currentPage = 0;

      const updatedButtons = buttonsRow.components.map((btn) =>
        ButtonBuilder.from(btn).setDisabled(arrEmbeds.length <= 1)
      );
      buttonsRow = new ActionRowBuilder().addComponents(updatedButtons);
      return msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] });
    }

    if (id === "previousBtn" && currentPage > 0) {
      currentPage--;
    } else if (id === "nextBtn" && currentPage < arrEmbeds.length - 1) {
      currentPage++;
    }

    return msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] });
  });

  collector.on("end", () => {
    if (msg.editable) {
      msg.edit({ components: [] }).catch(() => {});
    }
  });
}

function getSlashCategoryEmbeds(client, category) {
  const commands = Array.from(client.slashCommands.filter((cmd) => cmd.category === category).values());

  if (category === "IMAGE") {
    let desc = commands.map((cmd) => `\`/${cmd.name}\`\n ❯ ${cmd.description}\n\n`).join("");

    const filters = client.slashCommands.get("filter")?.slashCommand?.options?.[0]?.choices ?? [];
    const gens = client.slashCommands.get("generator")?.slashCommand?.options?.[0]?.choices ?? [];

    desc += `**Available Filters:** ${filters.map((c) => c.name).join(", ")}\n`;
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
        .setDescription("No commands in this category"),
    ];
  }

  const pages = [];
  for (let i = 0; i < commands.length; i += CMDS_PER_PAGE) {
    const chunk = commands.slice(i, i + CMDS_PER_PAGE);
    const desc = chunk
      .map((cmd) => {
        const subCmds = cmd.slashCommand.options?.filter((o) => o.type === ApplicationCommandOptionType.Subcommand);
        return `\`/${cmd.name}\`\n ❯ **Description**: ${cmd.description}\n${
          subCmds?.length ? ` ❯ **Subcommands**: ${subCmds.map((s) => s.name).join(", ")}\n` : ""
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

function getMsgCategoryEmbeds(client, category, prefix) {
  const commands = client.commands.filter((cmd) => cmd.category === category);

  if (category === "IMAGE") {
    let aliases = [];
    commands.forEach((cmd) => aliases.push(...(cmd.command.aliases || [])));

    return [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(CommandCategory[category]?.image)
        .setAuthor({ name: `${category} Commands` })
        .setDescription(
          `\`${aliases.join("`, `")}\`\n\nYou can use these image commands in the following formats:\n` +
          `**${prefix}cmd:** Use author's avatar\n` +
          `**${prefix}cmd <@member>:** Mentioned user's avatar\n` +
          `**${prefix}cmd <url>:** Custom image URL\n` +
          `**${prefix}cmd [attachment]:** Upload image`
        ),
    ];
  }

  if (commands.length === 0) {
    return [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(CommandCategory[category]?.image)
        .setAuthor({ name: `${category} Commands` })
        .setDescription("No commands in this category"),
    ];
  }

  const pages = [];
  for (let i = 0; i < commands.length; i += CMDS_PER_PAGE) {
    const chunk = commands.slice(i, i + CMDS_PER_PAGE);
    const desc = chunk
      .map((cmd) => {
        return `\`${cmd.name}\`\n ❯ **Usage**: ${prefix}${cmd.name}\n ❯ ${cmd.description}`;
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
