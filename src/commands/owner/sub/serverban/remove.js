const { EmbedBuilder } = require("discord.js");
const { OWNER_IDS } = require("../../../../../config");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");

const blacklistPath = path.join(__dirname, "../../../../../database/blacklist.json");

function readBlacklist() {
  try {
    return JSON.parse(readFileSync(blacklistPath, "utf8"));
  } catch {
    return { servers: [] };
  }
}

function writeBlacklist(data) {
  writeFileSync(blacklistPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "remove",
  description: "Remove a server from the blacklist",
  async messageRun(message, args) {
    if (!OWNER_IDS.includes(message.author.id)) {
      return message.reply("You don't have permission to use this command.");
    }

    const serverId = args[1];
    if (!serverId) return message.reply("Please provide a server ID.");

    const blacklist = readBlacklist();
    const index = blacklist.servers.indexOf(serverId);

    if (index === -1) {
      return message.reply("That server is not blacklisted.");
    }

    blacklist.servers.splice(index, 1);
    writeBlacklist(blacklist);

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Server Removed")
      .setDescription(`Server ID \`${serverId}\` has been removed from the blacklist.`)
      .setFooter({ text: `Requested by ${message.author.tag}` });

    return message.safeReply({ embeds: [embed] });
  },
};
