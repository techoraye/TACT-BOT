const { canModerate } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { OWNER_IDS } = require("../../../config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "nick",
  description: "nickname commands",
  category: "MODERATION",
  botPermissions: ["ManageNicknames"],
  userPermissions: ["ManageNicknames"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "set <@member> <name>",
        description: "sets the nickname of the specified member",
      },
      {
        trigger: "reset <@member>",
        description: "reset a members nickname",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "set",
        description: "change a members nickname",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the member whose nick you want to set",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "name",
            description: "the nickname to set",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reset",
        description: "reset a members nickname",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the members whose nick you want to reset",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: "all",
        description: "Set all non-admin members' nicknames (admin/bot owner only, slow mode)",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "The nickname to set for all non-admins",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "resetall",
        description: "Reset all non-admin members' nicknames (admin/bot owner only, slow mode)",
        type: ApplicationCommandOptionType.Subcommand,
        options: [],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "set") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Could not find matching member");
      const name = args.slice(2).join(" ");
      if (!name) return message.safeReply("Please specify a nickname");

      const response = await nickname(message, target, name);
      return message.safeReply(response);
    }

    else if (sub === "reset") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Could not find matching member");

      const response = await nickname(message, target);
      return message.safeReply(response);
    }
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();

    // /nick all
    if (sub === "all") {
      const isBotOwner = OWNER_IDS.includes(interaction.user.id);
      if (
        !isBotOwner &&
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        return interaction.followUp({
          content: "⛔ Only admins or bot owners can use this command.",
          ephemeral: true,
        });
      }
      const name = interaction.options.getString("name");
      let changed = 0, failed = 0;
      const members = await interaction.guild.members.fetch();

      await interaction.followUp({ content: "⏳ Changing nicknames for all non-admin members. This may take a while...", ephemeral: true });

      for (const member of members.values()) {
        if (
          member.user.bot ||
          member.id === interaction.client.user.id ||
          member.id === interaction.user.id ||
          member.permissions.has(PermissionFlagsBits.Administrator)
        ) continue;

        try {
          // Modern, clean embed + button for support server
          const embed = new EmbedBuilder()
            .setTitle("✏️ Your nickname has been changed")
            .setDescription([
              `Your nickname was changed in **${interaction.guild.name}**.`,
              `**New Nickname:** ${name}`,
              `**Changed by:** ${interaction.user.tag}`
            ].join("\n"))
            .setColor(0x5865F2)
            .setTimestamp();

          const button = new ButtonBuilder()
            .setLabel("Join Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/M7yyGfKdKx");

          const row = new ActionRowBuilder().addComponents(button);

          await member.send({ embeds: [embed], components: [row] }).catch(() => null);

          await member.setNickname(name);
          changed++;
          if (!isBotOwner) await new Promise(res => setTimeout(res, 1000)); // 1s delay for admin, none for bot owner
        } catch {
          failed++;
        }
      }

      // Modern summary embed for operation result
      const summaryEmbed = new EmbedBuilder()
        .setTitle("✅ Nickname Operation Complete")
        .setColor(0x57F287)
        .setDescription("All eligible members have been processed.")
        .addFields(
          { name: "Nicknames Changed", value: `${changed}`, inline: true },
          { name: "Failed", value: `${failed}`, inline: true }
        )
        .setTimestamp();

      return interaction.followUp({
        embeds: [summaryEmbed],
        ephemeral: true,
      });
    }

    // /nick resetall
    if (sub === "resetall") {
      const isBotOwner = OWNER_IDS.includes(interaction.user.id);
      if (
        !isBotOwner &&
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        return interaction.followUp({
          content: "⛔ Only admins or bot owners can use this command.",
          ephemeral: true,
        });
      }
      let reset = 0, failed = 0;
      const members = await interaction.guild.members.fetch();

      await interaction.followUp({ content: "⏳ Resetting nicknames for all non-admin members. This may take a while...", ephemeral: true });

      for (const member of members.values()) {
        if (
          member.user.bot ||
          member.id === interaction.client.user.id ||
          member.id === interaction.user.id ||
          member.permissions.has(PermissionFlagsBits.Administrator)
        ) continue;

        try {
          // Modern, clean embed + button for support server
          const embed = new EmbedBuilder()
            .setTitle("✏️ Your nickname has been reset")
            .setDescription([
              `Your nickname was reset in **${interaction.guild.name}**.`,
              `**Reset by:** ${interaction.user.tag}`
            ].join("\n"))
            .setColor(0x5865F2)
            .setTimestamp();

          const button = new ButtonBuilder()
            .setLabel("Join Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/M7yyGfKdKx");

          const row = new ActionRowBuilder().addComponents(button);

          await member.send({ embeds: [embed], components: [row] }).catch(() => null);

          await member.setNickname(null);
          reset++;
          if (!isBotOwner) await new Promise(res => setTimeout(res, 1000)); // 1s delay for admin, none for bot owner
        } catch {
          failed++;
        }
      }

      // Modern summary embed for operation result
      const summaryEmbed = new EmbedBuilder()
        .setTitle("✅ Nickname Reset Operation Complete")
        .setColor(0x57F287)
        .setDescription("All eligible members have been processed.")
        .addFields(
          { name: "Nicknames Reset", value: `${reset}`, inline: true },
          { name: "Failed", value: `${failed}`, inline: true }
        )
        .setTimestamp();

      return interaction.followUp({
        embeds: [summaryEmbed],
        ephemeral: true,
      });
    }

    // /nick set or /nick reset
    const name = interaction.options.getString("name");
    const target = await interaction.guild.members.fetch(interaction.options.getUser("user"));
    const response = await nickname(interaction, target, name);
    await interaction.followUp(response);
  },
};

async function nickname({ member, guild }, target, name) {
  if (!canModerate(member, target)) {
    return `Oops! You cannot manage nickname of ${target.user.username}`;
  }
  if (!canModerate(guild.members.me, target)) {
    return `Oops! I cannot manage nickname of ${target.user.username}`;
  }

  try {
    await target.setNickname(name);
    return `Successfully ${name ? "changed" : "reset"} nickname of ${target.user.username}`;
  } catch (ex) {
    return `Failed to ${name ? "change" : "reset"} nickname for ${target.displayName}. Did you provide a valid name?`;
  }
}
