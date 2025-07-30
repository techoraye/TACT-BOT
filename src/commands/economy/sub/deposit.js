const { depositCoins, getBalance } = require("@helpers/economy");
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
 * @param {import("discord.js").User} user
 * @param {number} amount
 * @param {string} serverId
 */
module.exports = async (user, amount, serverId) => {
  try {
    if (isNaN(amount) || amount <= 0) {
      return "🚫 Please enter a valid amount of coins to deposit.";
    }

    await depositCoins(user.id, amount, serverId);
    const { coins: wallet, bank } = await getBalance(user.id, serverId);

    const formattedWallet = formatCurrency(wallet);
    const formattedBank = formatCurrency(bank);
    const formattedNet = formatCurrency(wallet + bank);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("🏦 Deposit Successful")
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        {
          name: "🪙 Wallet",
          value: `\`\`\`${formattedWallet}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        },
        {
          name: "🏛️ Bank",
          value: `\`\`\`${formattedBank}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        },
        {
          name: "📊 Net Worth",
          value: `\`\`\`${formattedNet}${ECONOMY.CURRENCY}\`\`\``,
          inline: false,
        }
      )
      .setFooter({ text: 'Use "/bank balance" to check your account anytime.' })
      .setTimestamp();

    return { embeds: [embed] };
  } catch (err) {
    console.error(`❌ Deposit error for user ${user.id} in server ${serverId}:`, err);
    return "❌ There was an error processing your deposit. Please try again later.";
  }
};
