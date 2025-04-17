const { getBalance, updateUser } = require("@helpers/economy");
const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("../../../../config");

/**
 * @param {import("discord.js").User} user - The target user
 * @param {number} coins - Amount of coins to withdraw
 * @param {string} serverId - The guild ID
 */
module.exports = async (user, coins, serverId) => {
  try {
    // Validate amount
    if (isNaN(coins) || coins <= 0) {
      return "Please enter a valid amount of coins to withdraw.";
    }

    // Fetch user data
    const { bank } = await getBalance(user.id, serverId);

    // Check if the user has enough coins in the bank
    if (coins > bank) {
      return `You only have ${bank}${ECONOMY.CURRENCY} in your bank.`;
    }

    // Perform withdrawal: move coins from bank to wallet
    await updateUser(serverId, user.id, (u) => {
      u.coins += coins;  // Add coins to wallet
      u.bank -= coins;   // Remove coins from bank
    });

    // Fetch updated user balance
    const { coins: updatedCoins, bank: updatedBank } = await getBalance(user.id, serverId);

    // Create embed message to show updated balances
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor({ name: "New Balance", iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "Wallet", value: `${updatedCoins}${ECONOMY.CURRENCY}`, inline: true },
        { name: "Bank", value: `${updatedBank}${ECONOMY.CURRENCY}`, inline: true },
        { name: "Net Worth", value: `${updatedCoins + updatedBank}${ECONOMY.CURRENCY}`, inline: true }
      );

    return { embeds: [embed] };
  } catch (err) {
    console.error(`❌ Withdrawal error for ${user.id} in server ${serverId}:`, err);
    return "There was an error processing the withdrawal. Please try again later.";
  }
};
