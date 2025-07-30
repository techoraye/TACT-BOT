const { unTimeoutTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "unmute",
  description: "remove mute from a member",
  category: "MODERATION",
  botPermissions: ["ModerateMembers"],
  userPermissions: ["ModerateMembers"],
  command: {
    enabled: true,
    aliases: ["untimeout"],
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the target member",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "reason for unmute",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    try {
      console.log("[UNMUTE] Message command triggered");
      const target = await message.guild.resolveMember(args[0], true);
      console.log("[UNMUTE] Target resolved:", target?.user?.tag || "Not found");

      if (!target) return message.safeReply(`❌ No user found matching ${args[0]}`);

      const reason = args.slice(1).join(" ").trim();
      console.log("[UNMUTE] Reason:", reason || "No reason provided");

      const response = await unmute(message.member, target, reason);
      await message.safeReply(response);
    } catch (error) {
      console.error("[UNMUTE] Error in messageRun:", error);
      await message.safeReply("⚠️ An unexpected error occurred while trying to unmute.");
    }
  },

  async interactionRun(interaction) {
    try {
      console.log("[UNMUTE] Slash command triggered");
      const user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason") || "No reason provided";
      const target = await interaction.guild.members.fetch(user.id);

      console.log("[UNMUTE] Target fetched:", target?.user?.tag);
      console.log("[UNMUTE] Reason:", reason);

      const response = await unmute(interaction.member, target, reason);
      await interaction.followUp(response);
    } catch (error) {
      console.error("[UNMUTE] Error in interactionRun:", error);
      await interaction.followUp("⚠️ An unexpected error occurred while trying to unmute.");
    }
  },
};

async function unmute(issuer, target, reason) {
  try {
    console.log("[UNMUTE] Calling unTimeoutTarget");
    const response = await unTimeoutTarget(issuer, target, reason);
    console.log("[UNMUTE] unTimeoutTarget response:", response);

    if (typeof response === "boolean") return `✅ ${target.user.username} has been unmuted.`;
    if (response === "BOT_PERM") return `❌ I don't have permission to unmute ${target.user.username}.`;
    if (response === "MEMBER_PERM") return `❌ You don't have permission to unmute ${target.user.username}.`;
    if (response === "NO_MUTE") return `ℹ️ ${target.user.username} is not muted.`;
    return `❌ Failed to unmute ${target.user.username}.`;
  } catch (error) {
    console.error("[UNMUTE] Error in unmute function:", error);
    return "⚠️ An error occurred while unmuting the member.";
  }
}
