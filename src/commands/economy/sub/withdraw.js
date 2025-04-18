const { getBalance, updateUser } = require("@helpers/economy");
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
 * @param {import("discord.js").User} user - The target user
 * @param {number} coins - Amount of coins to withdraw
 * @param {string} serverId - The guild ID
 */
module.exports = async (user, coins, serverId) => {
  try {
    // Validate amount
    if (isNaN(coins) || coins <= 0) {
      return "🚫 Please enter a valid amount of coins to withdraw.";
    }

    // Fetch user data
    const { bank } = await getBalance(user.id, serverId);

    // Check if the user has enough coins in the bank
    if (coins > bank) {
      return `🚫 You only have ${formatCurrency(bank)}${ECONOMY.CURRENCY} in your bank.`;
    }

    // Perform withdrawal: move coins from bank to wallet
    await updateUser(serverId, user.id, (u) => {
      u.coins += coins;  // Add coins to wallet
      u.bank -= coins;   // Remove coins from bank
    });

    // Fetch updated user balance
    const { coins: updatedCoins, bank: updatedBank } = await getBalance(user.id, serverId);

    // Format the updated balances for display
    const formattedCoins = formatCurrency(updatedCoins);
    const formattedBank = formatCurrency(updatedBank);
    const formattedNetWorth = formatCurrency(updatedCoins + updatedBank);

    // Create embed message to show updated balances
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle(`💰 Withdrawal Successful`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        {
          name: `🪙 Wallet`,
          value: `\`\`\`${formattedCoins}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        },
        {
          name: `🏦 Bank`,
          value: `\`\`\`${formattedBank}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        },
        {
          name: `📊 Net Worth`,
          value: `\`\`\`${formattedNetWorth}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        }
      )
      .setFooter({ text: "Your transaction has been successfully processed." })
      .setTimestamp();

    return { embeds: [embed] };
  } catch (err) {
    console.error(`❌ Withdrawal error for ${user.id} in server ${serverId}:`, err);
    return "❌ There was an error processing the withdrawal. Please try again later.";
  }
};
