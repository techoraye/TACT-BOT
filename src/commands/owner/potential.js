const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { OWNER_IDS } = require('../../../config.js'); // Assuming OWNER_IDS is defined in config.js

const IDLE_TIMEOUT = 30; // in seconds
const MAX_PER_PAGE = 10; // max number of embed fields per page

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "potential",
  description: "Evaluate the bot's success potential based on all servers.",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["botpotential", "successpotential"],
    usage: "[match]",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    // Check if the user is the bot owner
    if (!OWNER_IDS.includes(message.author.id)) {
      return message.reply("You don't have permission to use this command.");
    }

    const { client, channel, member } = message;
    const match = args.join(" ") || null;
    const matchedGuilds = [];

    if (match) {
      // Match by ID or name
      if (client.guilds.cache.has(match)) {
        matchedGuilds.push(client.guilds.cache.get(match));
      } else {
        client.guilds.cache
          .filter(guild => guild.name.toLowerCase().includes(match.toLowerCase()))
          .forEach(guild => matchedGuilds.push(guild));
      }
    }

    const servers = match ? matchedGuilds : Array.from(client.guilds.cache.values());
    const totalServers = servers.length;
    const totalMembers = servers.reduce((acc, guild) => acc + guild.memberCount, 0);
    const maxPerPage = MAX_PER_PAGE;
    const totalPages = Math.ceil(totalServers / maxPerPage);

    if (totalPages === 0) return message.safeReply("No servers found.");
    let currentPage = 1;

    // Pagination buttons
    let components = [
      new ButtonBuilder().setCustomId("prevBtn").setEmoji("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId("nxtBtn").setEmoji("➡️").setStyle(ButtonStyle.Secondary).setDisabled(totalPages === 1),
    ];
    let buttonsRow = new ActionRowBuilder().addComponents(components);

    // Embed Builder
    const buildEmbed = () => {
      const start = (currentPage - 1) * maxPerPage;
      const end = Math.min(start + maxPerPage, totalServers);
      const serversOnPage = servers.slice(start, end);

      const embed = new EmbedBuilder()
        .setColor(client.config.EMBED_COLORS.BOT_EMBED)
        .setAuthor({ name: "Bot Success Potential Evaluation", iconURL: client.user.avatarURL() })
        .setFooter({ text: `Page ${currentPage} of ${totalPages} • Total Servers: ${totalServers}` });

      const fields = [
        {
          name: "Bot's Success Potential",
          value: `**Total Members:** ${totalMembers}\n**Servers Count:** ${totalServers}\n` +
            `**Success Potential:** ${calculateSuccessPotential(totalMembers, totalServers)}%\n` +
            `**Estimated Time to Success:** ${calculateTimeToSuccess(totalMembers, totalServers)}`
        },
        {
          name: "Detailed Server Metrics",
          value: serversOnPage.map(guild => {
            const creationDate = guild.createdAt.toLocaleDateString();
            const botJoinDate = guild.members.cache.get(client.user.id)?.joinedAt?.toLocaleDateString() || "N/A";
            const activeMembers = guild.members.cache.filter(m => m.presence?.status === "online").size;
            return `**${guild.name}**\n` +
              `• Created: ${creationDate}\n` +
              `• Bot Join Date: ${botJoinDate}\n` +
              `• Active Members: ${activeMembers}\n` +
              `• Total Members: ${guild.memberCount}`;
          }).join("\n") || "No servers to display."
        },
        {
          name: "Success Potential Breakdown",
          value: `**Average Members Per Server:** ${(totalMembers / totalServers).toFixed(2)}\n` +
            `• Potential is correlated with average server size.\n` +
            `• The larger the servers, the higher the potential for growth.`
        },
        {
          name: "Estimated Growth",
          value: `Based on current member count and server size, we estimate:\n` +
            `• **Short-term Growth (3-6 Months):** Expect a steady increase in member count and engagement.\n` +
            `• **Long-term Growth (1-3 Years):** Potential to expand significantly if activity and engagement remain stable.`
        }
      ];

      embed.addFields(fields);
      return embed;
    };

    // Start typing indicator
    message.channel.sendTyping();

    // Send initial message with embed and buttons
    const sentMsg = await channel.send({ embeds: [buildEmbed()], components: [buttonsRow] });

    // Collector for button interactions
    const collector = channel.createMessageComponentCollector({
      filter: (interaction) => interaction.user.id === member.id && interaction.message.id === sentMsg.id,
      idle: IDLE_TIMEOUT * 1000,
      dispose: true,
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (interaction) => {
      if (!["prevBtn", "nxtBtn"].includes(interaction.customId)) return;
      await interaction.deferUpdate();

      // Update pagination buttons
      switch (interaction.customId) {
        case "prevBtn":
          if (currentPage > 1) currentPage--;
          break;
        case "nxtBtn":
          if (currentPage < totalPages) currentPage++;
          break;
      }

      // Rebuild and edit the embed with new page data
      const embed = buildEmbed();
      buttonsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("prevBtn").setEmoji("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 1),
        new ButtonBuilder().setCustomId("nxtBtn").setEmoji("➡️").setStyle(ButtonStyle.Secondary).setDisabled(currentPage === totalPages)
      );

      await sentMsg.edit({ embeds: [embed], components: [buttonsRow] });
    });

    collector.on("end", async () => {
      await sentMsg.edit({ components: [] }); // Disable buttons when the collector ends
    });
  },
};

// Helper function to calculate the bot's success potential based on total members and servers
function calculateSuccessPotential(totalMembers, totalServers) {
  const averageMembersPerServer = totalMembers / totalServers;
  return Math.min((averageMembersPerServer / 100) * 100, 100); // Success potential capped at 100%
}

// Helper function to calculate the estimated time to success based on success potential
function calculateTimeToSuccess(totalMembers, totalServers) {
  const successPotential = calculateSuccessPotential(totalMembers, totalServers);

  if (successPotential < 10) return "5+ Years";
  if (successPotential < 30) return "1-3 Years";
  if (successPotential < 50) return "6-12 Months";
  if (successPotential < 70) return "3-6 Months";
  return "1-3 Months";
}