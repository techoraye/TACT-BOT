const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { OWNER_IDS, EMBED_COLORS } = require("../../../config.js");

module.exports = {
  name: "listinvites",
  description: "List all available invite links across all servers the bot is in",
  category: "OWNER",
  botPermissions: ["EmbedLinks", "ManageGuild"],
  command: {
    enabled: true,
    aliases: ["serverinvites"],
    usage: "",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message) {
    if (!OWNER_IDS.includes(message.author.id)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("⛔ Access Denied")
            .setDescription("Only bot owners can use this command."),
        ],
      });
    }

    const allGuilds = message.client.guilds.cache.toJSON();
    let pages = [];

    for (const guild of allGuilds) {
      try {
        const invites = await guild.invites.fetch();
        const firstInvite = invites.find((inv) => inv.maxAge === 0 || inv.maxUses === 0) || invites.first();

        const inviteURL = firstInvite?.url ?? "*No invite found*";
        const uses = firstInvite?.uses ?? 0;

        const embed = new EmbedBuilder()
          .setTitle(`📨 Invite Link - ${guild.name}`)
          .setColor(EMBED_COLORS.BOT_EMBED)
          .addFields(
            { name: "Guild ID", value: `\`${guild.id}\`` },
            { name: "Invite", value: `${inviteURL}`, inline: false },
            { name: "Uses", value: `\`${uses}\``, inline: true },
            { name: "Members", value: `\`${guild.memberCount}\``, inline: true }
          )
          .setFooter({ text: `Requested by ${message.author.tag}` })
          .setThumbnail(guild.iconURL({ dynamic: true }));

        pages.push(embed);
      } catch (err) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`⚠️ Unable to fetch invites for ${guild.name}`)
          .setDescription("Missing permissions or no invites exist.")
          .setColor("Orange");

        pages.push(errorEmbed);
      }
    }

    if (pages.length === 0) {
      return message.reply("No guilds found or no invites available.");
    }

    let index = 0;
    const getRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("prev").setLabel("◀ Previous").setStyle(ButtonStyle.Secondary).setDisabled(index === 0),
        new ButtonBuilder().setCustomId("next").setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(index === pages.length - 1)
      );

    const msg = await message.reply({ embeds: [pages[index]], components: [getRow()] });

    const collector = msg.createMessageComponentCollector({
      time: 2 * 60 * 1000,
    });

    collector.on("collect", (i) => {
      if (i.user.id !== message.author.id) return i.reply({ content: "Only the command author can use these buttons.", ephemeral: true });

      if (i.customId === "prev" && index > 0) index--;
      if (i.customId === "next" && index < pages.length - 1) index++;

      i.update({ embeds: [pages[index]], components: [getRow()] });
    });

    collector.on("end", () => {
      msg.edit({ components: [] });
    });
  },
};
