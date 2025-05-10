const { EmbedBuilder } = require("discord.js");
const { OWNER_IDS } = require("../../../../../config");
const { readFileSync } = require("fs");
const path = require("path");

const blacklistPath = path.join(__dirname, "../../../../../database/blacklist.json");

function readBlacklist() {
  try {
    return JSON.parse(readFileSync(blacklistPath, "utf8"));
  } catch {
    return { servers: [] };
  }
}

module.exports = {
  name: "list",
  description: "List all blacklisted servers",
  async messageRun(message) {
    if (!OWNER_IDS.includes(message.author.id)) {
      return message.reply("You don't have permission to use this command.");
    }

    const blacklist = readBlacklist();
    const ids = blacklist.servers;

    const embed = new EmbedBuilder()
      .setTitle("📄 Blacklisted Servers")
      .setColor("Yellow")
      .setDescription(ids.length > 0 ? ids.map((id, i) => `\`${i + 1}.\` ${id}`).join("\n") : "No servers are blacklisted.")
      .setFooter({ text: `Total: ${ids.length}` });

    return message.safeReply({ embeds: [embed] });
  },
};
