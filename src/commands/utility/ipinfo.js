const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ipinfo",
  description: "Get information about an IP address",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["ip", "iplookup"],
    usage: "<ip-address>",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    const ip = args[0];
    if (!ip) return message.safeReply("Please provide an IP address.");

    let res;
    try {
      res = await axios.get(`http://ip-api.com/json/${ip}?fields=66846719`);
    } catch (error) {
      return message.safeReply("Failed to fetch IP information.");
    }

    const data = res.data;
    if (data.status !== "success") {
      return message.safeReply("Invalid IP address or no data available.");
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `IP Information for ${ip}` })
      .setColor(message.client.config.EMBED_COLORS.BOT_EMBED)
      .setTimestamp()
      .addFields(
        { name: "Country", value: `${data.country} (${data.countryCode})`, inline: true },
        { name: "Region", value: `${data.regionName} (${data.region})`, inline: true },
        { name: "City", value: data.city || "N/A", inline: true },
        { name: "ZIP", value: data.zip || "N/A", inline: true },
        { name: "ISP", value: data.isp || "N/A", inline: true },
        { name: "Org", value: data.org || "N/A", inline: true },
        { name: "ASN", value: data.as || "N/A", inline: true },
        { name: "Timezone", value: data.timezone || "N/A", inline: true },
        { name: "Coordinates", value: `Lat: ${data.lat}, Lon: ${data.lon}`, inline: true }
      )
      .setFooter({ text: "Powered by ip-api.com" });

    return message.safeReply({ embeds: [embed] });
  },
};
