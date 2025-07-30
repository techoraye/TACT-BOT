const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { OWNER_IDS } = require("../../../config.js");

module.exports = {
  name: "shutdown",
  description: "Gracefully shut down the bot (Owner only)",
  category: "OWNER",
  botPermissions: ["SendMessages", "EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["poweroff"],
    usage: "",
    cooldown: 300,
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message) {
    const isOwner = OWNER_IDS.includes(message.author.id);
    if (!isOwner) {
      return message.reply("❌ You are not authorized to use this command.");
    }

    // Start typing indicator
    message.channel.sendTyping();

    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("🛑 Bot Shutdown")
      .setDescription("Shutting down the bot process.")
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    console.log(`[SHUTDOWN] Shutdown initiated by ${message.author.tag} (${message.author.id})`);

    process.exit(0); // Triggers auto-restart if hosted properly
  },
};
