const { EmbedBuilder } = require("discord.js");
const config = require("@root/config.js");
const { ECONOMY } = require("@root/config.js");

/**
 * Format numbers into compact human-readable strings
 * e.g., 1.2K, 3.5M, 7.1B, 2.3T, etc.
 * Shows "0" if value is 0.
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  if (amount === 0) return "0";

  const suffixes = ["", "K", "M", "B", "T", "Q", "Qn", "Sx", "Sp", "Oc", "No", "Dc"];
  let tier = Math.floor(Math.log10(Math.abs(amount)) / 3);
  if (tier === 0) return amount.toString();

  const suffix = suffixes[tier] || `e${tier * 3}`;
  const scale = Math.pow(10, tier * 3);
  const scaled = (amount / scale).toFixed(1);

  return `${scaled}${suffix}`;
}

module.exports = {
  name: "changelogs",
  description: "Shows the latest bot updates and changes",
  cooldown: 5,
  isPremium: false,
  category: "INFORMATION",
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: [],
  validations: [],
  command: {
    enabled: true,
    aliases: ["updates", "news"],
    usage: "/changelogs",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },

  messageRun: async (message) => {
    // New economy update
    const totalEconomy = ECONOMY.STARTING_BALANCE || 1000; // default starting balance

    const embed = new EmbedBuilder()
      .setTitle("📢 Bot Changelogs")
      .setColor("#FFA500")
      .setDescription("Here are the latest updates and changes:")
      .addFields(
        {
          name: "🚀 Beta Version",
          value: `Currently running **v${config.BETA_VERSION}**`,
        },
        {
          name: "✅ Improved Database System",
          value: "Switched to a more optimized structure for per-server data management.",
        },
        {
          name: "🛠️ Fixed Economy System",
          value: "All economy commands now use the new per-server & per-user data format properly.",
        },
        {
          name: "💰 Economy System Update",
          value: `The new economy system has been implemented! Every user now starts with **${formatCurrency(totalEconomy)}** ${ECONOMY.CURRENCY}.`,
        },
        {
          name: "🔜 Coming Soon: Economy Commands",
          value: `Stay tuned! We will soon be rolling out new economy-related commands like **/beg**, **/work**, and more to help you grow your wealth!`,
        }
      )
      .setFooter({ text: "Stay updated with the latest changes!" })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    // New economy update
    const totalEconomy = ECONOMY.STARTING_BALANCE || 1000; // default starting balance

    const embed = new EmbedBuilder()
      .setTitle("📢 Bot Changelogs")
      .setColor("#FFA500")
      .setDescription("Here are the latest updates and changes:")
      .addFields(
        {
          name: "🚀 Beta Version",
          value: `Currently running **v${config.BETA_VERSION}**`,
        },
        {
          name: "✅ Improved Database System",
          value: "Switched to a more optimized structure for per-server data management.",
        },
        {
          name: "🛠️ Fixed Economy System",
          value: "All economy commands now use the new per-server & per-user data format properly.",
        },
        {
          name: "💰 Economy System Update",
          value: `The new economy system has been implemented! Every user now starts with **${formatCurrency(totalEconomy)}** ${ECONOMY.CURRENCY}.`,
        },
        {
          name: "🔜 Coming Soon: Economy Commands",
          value: `Stay tuned! We will soon be rolling out new economy-related commands like **/beg**, **/work**, and more to help you grow your wealth!`,
        }
      )
      .setFooter({ text: "Stay updated with the latest changes!" })
      .setTimestamp();

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  },
};
