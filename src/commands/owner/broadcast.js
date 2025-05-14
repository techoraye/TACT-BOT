const { EmbedBuilder } = require("discord.js");
const { OWNER_IDS, EMBED_COLORS } = require("../../../config.js");

module.exports = {
  name: "broadcast",
  description: "Send a message embed to every server the bot is in.",
  category: "OWNER",
  botPermissions: ["SendMessages", "EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["bc"],
    usage: "<message>",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
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

    const broadcastContent = args.join(" ");
    if (!broadcastContent) {
      return message.reply("❌ You must provide a message to broadcast.");
    }

    const broadcastEmbed = new EmbedBuilder()
      .setTitle("📢 Announcement")
      .setDescription(broadcastContent)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setFooter({ text: `Sent by ${message.author.tag}` })
      .setTimestamp();

    const guilds = message.client.guilds.cache.toJSON();
    let success = 0;
    let failed = 0;

    for (const guild of guilds) {
      let targetChannel = guild.systemChannel;

      if (!targetChannel || !targetChannel.permissionsFor(guild.members.me).has("SendMessages")) {
        // Try to find the first suitable text channel
        targetChannel = guild.channels.cache.find(
          (ch) =>
            ch.isTextBased() &&
            ch.permissionsFor(guild.members.me).has("SendMessages") &&
            !ch.isThread()
        );
      }

      if (!targetChannel) {
        failed++;
        continue;
      }

      try {
        await targetChannel.send({ embeds: [broadcastEmbed] });
        success++;
      } catch (e) {
        failed++;
      }
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle("✅ Broadcast Complete")
          .setDescription(`**Success:** \`${success}\`\n**Failed:** \`${failed}\``),
      ],
    });
  },
};
