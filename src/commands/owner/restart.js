const { EmbedBuilder, Colors } = require("discord.js");
const { OWNER_IDS } = require("../../../config.js");
const { spawn } = require("child_process");

module.exports = {
  name: "restart",
  description: "Restarts the bot (Owner only)",
  category: "OWNER",
  botPermissions: ["SendMessages", "EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["reboot", "reload"],
    usage: "",
    cooldown: 300,
  },

  async messageRun(message) {
    if (!OWNER_IDS.includes(message.author.id)) {
      return message.reply("❌ **You are not authorized to use this command.**");
    }

    const client = message.client;

    // Start typing indicator
    message.channel.sendTyping();

    const embed = new EmbedBuilder()
      .setColor(client.config?.EMBED_COLORS?.BOT_EMBED || Colors.Blue)
      .setTitle("🔄 Bot Restarting...")
      .setDescription("Spawning a new bot instance⏳")
      .setFooter({ text: `Requested by ${message.author.tag}` });

    await message.reply({ embeds: [embed] });

    console.log(`[RESTART] Triggered by ${message.author.tag} (${message.author.id})`);

    try {
      // Using 'spawn' to execute a shell command to run the bash script
      const restartCommand = spawn("bash", ["-c", "./restart.sh"]);

      // Handle output from the script
      restartCommand.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      restartCommand.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      restartCommand.on("close", (code) => {
        console.log(`Child process exited with code ${code}`);
      });

      console.log("[RESTART] Bot process will now exit...");
      process.exit(0);  // Clean shutdown

    } catch (err) {
      console.error("❌ Restart error:", err);
      const errorEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("❌ Restart Failed")
        .setDescription("There was an error while trying to restart the bot.")
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};
