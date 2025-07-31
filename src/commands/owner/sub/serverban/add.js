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
  name: "add",
  description: "Add a server to the blacklist",
  async messageRun(message, args) {
    if (!OWNER_IDS.includes(message.author.id)) {
      return message.reply("You don't have permission to use this command.");
    }

    const serverId = args[1];
    if (!serverId) return message.reply("Please provide a server ID.");

    const blacklist = readBlacklist();

    if (blacklist.servers.includes(serverId)) {
      return message.reply("This server is already blacklisted.");
    }

    blacklist.servers.push(serverId);
    writeBlacklist(blacklist);

    const guild = message.client.guilds.cache.get(serverId);
    if (guild) {
      await guild.leave().catch(() => null);
    }

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🚫 Server Blacklisted")
      .setDescription(`Server ID \`${serverId}\` has been added to the blacklist.`)
      .setFooter({ text: `Requested by ${message.author.tag}` });

    return message.safeReply({ embeds: [embed] });
  },
};
