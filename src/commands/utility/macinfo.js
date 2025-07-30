const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

const API_KEY = "at_MiKZfBl0u002kysPvJQoPC6sXOkol"; // Your API key

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "macinfo",
  description: "Get information about a MAC address",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["mac", "maclookup"],
    usage: "<mac-address>",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    const mac = args[0];
    if (!mac || !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac)) {
      return message.safeReply("❌ Please provide a valid MAC address (e.g., `00:1A:79:12:34:56`).");
    }

    try {
      const res = await axios.get(`https://api.macaddress.io/v1`, {
        params: {
          apiKey: API_KEY,
          output: "json",
          search: mac,
        },
      });

      const { vendorDetails, blockDetails, macAddressDetails } = res.data;

      const embed = new EmbedBuilder()
        .setAuthor({ name: "MAC Address Lookup" })
        .setColor(message.client.config.EMBED_COLORS.BOT_EMBED)
        .addFields(
          { name: "MAC Address", value: macAddressDetails.searchTerm || "N/A", inline: true },
          { name: "Valid Format", value: macAddressDetails.isValid ? "✅ Yes" : "❌ No", inline: true },
          { name: "Company", value: vendorDetails.companyName || "Unknown", inline: true },
          { name: "Country", value: vendorDetails.countryCode || "N/A", inline: true },
          { name: "Company Address", value: vendorDetails.companyAddress || "N/A", inline: false },
          { name: "Block Start", value: blockDetails.borderLeft || "N/A", inline: true },
          { name: "Block End", value: blockDetails.borderRight || "N/A", inline: true },
          { name: "Block Size", value: `${blockDetails.blockSize || "N/A"} (${blockDetails.assignmentBlockSize || "N/A"})`, inline: true },
          { name: "Created", value: blockDetails.dateCreated || "N/A", inline: true },
          { name: "Updated", value: blockDetails.dateUpdated || "N/A", inline: true },
        )
        .setFooter({ text: "Powered by macaddress.io" });

      return message.safeReply({ embeds: [embed] });
    } catch (error) {
      console.error("MAC Lookup Error:", error);
      return message.safeReply("❌ Failed to fetch MAC address information. Please check the address or try again later.");
    }
  },
};
