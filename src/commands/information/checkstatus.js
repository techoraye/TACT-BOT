const { EmbedBuilder } = require("discord.js");
const mongoose = require("mongoose");
const net = require("net");
require("dotenv").config(); // Load environment variables from .env file

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "checkstatus",
  description: "Verifies MongoDB connection and checks external node status",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["verifystatus", "dbping"],
    usage: "",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message) {
    const embed = new EmbedBuilder().setColor(message.client.config.EMBED_COLORS.BOT_EMBED);
    let mongoStatus = "❌ Not connected";
    let nodeStatus = "❌ Unreachable";
    let latency = "N/A";

    // 1. MongoDB Status
    try {
      const dbConnection = await mongoose.connect(process.env.MONGO_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      mongoStatus = dbConnection.connection.readyState === 1 ? "🟢 Connected" : "🔴 Disconnected";
    } catch (error) {
      mongoStatus = `❌ Error: ${error.message}`;
    }

    const host = "37.27.141.177";
    const port = 22348;

    try {
      const start = Date.now();
      await new Promise((resolve, reject) => {
        const socket = net.createConnection(port, host);
        socket.setTimeout(3000);

        socket.on("connect", () => {
          latency = `${Date.now() - start}ms`;
          nodeStatus = "🟢 Online";
          socket.end();
          resolve();
        });

        socket.on("timeout", () => {
          nodeStatus = "⛔ Timed out";
          socket.destroy();
          reject();
        });

        socket.on("error", (err) => {
          nodeStatus = `❌ Error: ${err.message}`;
          reject();
        });
      });
    } catch (err) {
      nodeStatus = `❌ Error: ${err.message}`;
    }

    embed.setTitle("System Status Report").addFields(
      { name: "📦 MongoDB", value: mongoStatus, inline: true },
      { name: "🌐 Node", value: nodeStatus, inline: true },
      { name: "📶 Latency", value: latency, inline: true }
    );

    return message.safeReply({ embeds: [embed] });
  },
};
