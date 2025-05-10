const {
  EmbedBuilder,
} = require("discord.js");
const { OWNER_IDS } = require("../../../config.js");

module.exports = {
  name: "potential",
  description: "Evaluate the bot's global success potential.",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["botpotential", "successpotential"],
    usage: "",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message) {
    if (!OWNER_IDS.includes(message.author.id)) {
      return message.reply("You don't have permission to use this command.");
    }

    const { client } = message;

    const servers = Array.from(client.guilds.cache.values());
    const totalServers = servers.length;
    const totalMembers = servers.reduce((acc, g) => acc + g.memberCount, 0);

    const embed = new EmbedBuilder()
      .setColor(client.config.EMBED_COLORS.BOT_EMBED)
      .setTitle("🤖 Bot Success Potential Overview")
      .setDescription(
        `Here's a global view of the bot's current performance and potential.`
      )
      .addFields(
        {
          name: "📊 Global Stats",
          value:
            `• **Servers Count:** ${totalServers}\n` +
            `• **Total Members:** ${totalMembers}`,
        },
        {
          name: "📈 Potential Estimate",
          value:
            `• **Success Potential Score:** ${calculateSuccessPotential(totalMembers, totalServers)}%\n` +
            `• **ETA to Success:** ${calculateTimeToSuccess(totalMembers, totalServers)}`,
        },
        {
          name: "📉 Growth Forecast",
          value:
            `• **Short-term:** Increase engagement.\n` +
            `• **Long-term:** Strong if maintained.`,
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` });

    return message.safeReply({ embeds: [embed] });
  },
};

// Helpers
function calculateSuccessPotential(totalMembers, totalServers) {
  const avg = totalMembers / totalServers;
  return Math.min((avg / 100) * 100, 100).toFixed(2);
}

function calculateTimeToSuccess(totalMembers, totalServers) {
  const potential = calculateSuccessPotential(totalMembers, totalServers);
  const p = parseFloat(potential);
  if (p < 10) return "5+ Years";
  if (p < 30) return "1-3 Years";
  if (p < 50) return "6-12 Months";
  if (p < 70) return "3-6 Months";
  return "1-3 Months";
}
