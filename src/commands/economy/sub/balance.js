const { getBalance } = require("@helpers/economy");
const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("../../../../config");

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

/**
 * @param {User} user - The target user
 * @param {string} serverId - The guild ID
 */
module.exports = async (user, serverId) => {
  try {
    const { coins, bank } = await getBalance(user.id, serverId);

    const formattedCoins = formatCurrency(coins);
    const formattedBank = formatCurrency(bank);
    const formattedNetWorth = formatCurrency(coins + bank);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle(`💰 ${user.username}'s Balance`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        {
          name: "🪙 Wallet",
          value: `\`\`\`${formattedCoins}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        },
        {
          name: "🏦 Bank",
          value: `\`\`\`${formattedBank}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        },
        {
          name: "📊 Net Worth",
          value: `\`\`\`${formattedNetWorth}${ECONOMY.CURRENCY}\`\`\``,
          inline: false,
        }
      )
      .setFooter({ text: '💼 Use "/bank deposit" and "/bank withdraw" to manage your funds.' })
      .setTimestamp();

    return { embeds: [embed] };
  } catch (error) {
    console.error(error);
    return {
      content: "There was an error retrieving the balance. Please try again later.",
    };
  }
};
