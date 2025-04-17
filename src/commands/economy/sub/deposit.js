// src/commands/economy/sub/deposit.js
const { depositCoins, getBalance } = require("@helpers/economy");
const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("../../../../config");

/**
 * @param {import("discord.js").User} user
 * @param {number} amount
 * @param {string} serverId
 */
module.exports = async (user, amount, serverId) => {
  try {
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return "Please enter a valid amount of coins to deposit.";
    }

    // Perform the deposit
    await depositCoins(user.id, amount, serverId);

    // Fetch the updated balances
    const { coins: wallet, bank } = await getBalance(user.id, serverId);

    // Build the embed
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor({ name: "New Balance", iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "Wallet", value: `${wallet}${ECONOMY.CURRENCY}`, inline: true },
        { name: "Bank", value: `${bank}${ECONOMY.CURRENCY}`, inline: true },
        { name: "Net Worth", value: `${wallet + bank}${ECONOMY.CURRENCY}`, inline: true }
      );

    return { embeds: [embed] };
  } catch (err) {
    console.error(`❌ Deposit error for user ${user.id} in server ${serverId}:`, err);
    return "There was an error processing your deposit. Please try again later.";
  }
};
