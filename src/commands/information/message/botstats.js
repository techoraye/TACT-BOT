const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botstats",
  description: "shows bot information",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    aliases: ["botstat"],
  },

  async messageRun(message, args) {
    const response = botstats(message.client, false);
    await message.safeReply(response);
  },
};
