const { kickTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { OWNER_IDS } = require("../../../config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "kick",
  description: "Kick a user (mod) or all non-admin (admin/bot owner only, slow mode for all).",
  category: "MODERATION",
  botPermissions: ["KickMembers"],
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "Kick a specific user",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "target",
            description: "The member to kick",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "Reason for kick",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "all",
        description: "Kick all non-admin (admin/bot owner only, slow mode)",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "reason",
            description: "Reason for kicking all",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    // Only handle single user kick in message command
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await kick(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();

    // /kick all
    if (sub === "all") {
      // Allow admin or bot owner
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
      const reason = interaction.options.getString("reason");
      let kicked = 0, failed = 0;
      const members = await interaction.guild.members.fetch();

      await interaction.followUp({ content: "⏳ Kicking all non-admin. This may take a while...", ephemeral: true });

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
            .setTitle("🔨 You have been kicked")
            .setDescription([
              `You were kicked from **${interaction.guild.name}**.`,
              `**Reason:** ${reason}`,
              `**Kicked by:** ${interaction.user.tag}`
            ].join("\n"))
            .setColor(0xED4245)
            .setTimestamp();

          const button = new ButtonBuilder()
            .setLabel("Join Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/M7yyGfKdKx");

          const row = new ActionRowBuilder().addComponents(button);

          await member.send({ embeds: [embed], components: [row] }).catch(() => null);

          await member.kick(reason);
          kicked++;
          await new Promise(res => setTimeout(res, 2000)); // 2s cooldown per kick
        } catch {
          failed++;
        }
      }

      // Modern summary embed for operation result
      const summaryEmbed = new EmbedBuilder()
        .setTitle("✅ Kick Operation Complete")
        .setColor(0x57F287)
        .setDescription("All eligible members have been processed.")
        .addFields(
          { name: "Members Kicked", value: `${kicked}`, inline: true },
          { name: "Failed", value: `${failed}`, inline: true }
        )
        .setTimestamp();

      return interaction.followUp({
        embeds: [summaryEmbed],
        ephemeral: true,
      });
    }

    // /kick user
    if (sub === "user") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return interaction.followUp({ content: "You do not have permission to kick members.", ephemeral: true });
      }
      const user = interaction.options.getUser("target");
      const reason = interaction.options.getString("reason");
      const target = await interaction.guild.members.fetch(user.id);

      const response = await kick(interaction.member, target, reason);
      await interaction.followUp(response);
    }
  },
};

async function kick(issuer, target, reason) {
  const response = await kickTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.user.username} is kicked!`;
  if (response === "BOT_PERM") return `I do not have permission to kick ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to kick ${target.user.username}`;
  else return `Failed to kick ${target.user.username}`;
}
