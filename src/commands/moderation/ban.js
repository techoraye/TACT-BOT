const { banTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { OWNER_IDS } = require("../../../config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ban",
  description: "Ban a user (mod) or all non-admin (admin/bot owner only, slow mode for all).",
  category: "MODERATION",
  botPermissions: ["BanMembers"],
  userPermissions: ["BanMembers"],
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
        description: "Ban a specific user",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "target",
            description: "The member to ban",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "Reason for ban",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "all",
        description: "Ban all non-admin (admin/bot owner only, slow mode)",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "reason",
            description: "Reason for banning all",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    // Only handle single user ban in message command
    const match = await message.client.resolveUsers(args[0], true);
    const target = match[0];
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await ban(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();

    // /ban all
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
      let banned = 0, failed = 0;
      const members = await interaction.guild.members.fetch();

      await interaction.followUp({ content: "⏳ Banning all non-admin members. This may take a while...", ephemeral: true });

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
            .setTitle("🔨 You have been banned")
            .setDescription([
              `You were banned from **${interaction.guild.name}**.`,
              `**Reason:** ${reason}`,
              `**Banned by:** ${interaction.user.tag}`
            ].join("\n"))
            .setColor(0xED4245)
            .setTimestamp();

          const button = new ButtonBuilder()
            .setLabel("Join Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/M7yyGfKdKx");

          const row = new ActionRowBuilder().addComponents(button);

          await member.send({ embeds: [embed], components: [row] }).catch(() => null);

          await member.ban({ reason });
          banned++;
          await new Promise(res => setTimeout(res, 2000)); // 2s cooldown per ban
        } catch {
          failed++;
        }
      }

      // Modern summary embed for operation result
      const summaryEmbed = new EmbedBuilder()
        .setTitle("✅ Ban Operation Complete")
        .setColor(0x57F287)
        .setDescription("All eligible members have been processed.")
        .addFields(
          { name: "Members Banned", value: `${banned}`, inline: true },
          { name: "Failed", value: `${failed}`, inline: true }
        )
        .setTimestamp();

      return interaction.followUp({
        embeds: [summaryEmbed],
        ephemeral: true,
      });
    }

    // /ban user
    if (sub === "user") {
      const user = interaction.options.getUser("target");
      const reason = interaction.options.getString("reason");
      const target = await interaction.guild.members.fetch(user.id);

      const response = await ban(interaction.member, target, reason);
      await interaction.followUp(response);
    }
  },
};

/**
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function ban(issuer, target, reason) {
  const response = await banTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.user.username} is banned!`;
  if (response === "BOT_PERM") return `I do not have permission to ban ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to ban ${target.user.username}`;
  else return `Failed to ban ${target.user.username}`;
}
