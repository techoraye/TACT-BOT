const { transferCoins, getBalance } = require("@helpers/economy");
const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("../../../../config");

/**
 * @param {import("discord.js").User} sender
 * @param {import("discord.js").User} receiver
 * @param {number} coins
 * @param {string} serverId
 */
module.exports = async (sender, receiver, coins, serverId) => {
  try {
    // Validate amount
    if (isNaN(coins) || coins <= 0) {
      return "Please enter a valid amount of coins to transfer.";
    }

    // Perform the transfer
    await transferCoins(sender.id, receiver.id, coins, serverId);

    // Fetch updated balances for both sender and receiver
    const { coins: senderCoins, bank: senderBank } = await getBalance(sender.id, serverId);
    const { coins: receiverCoins, bank: receiverBank } = await getBalance(receiver.id, serverId);

    // Create the embed response
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor({ name: `${sender.username} transferred coins to ${receiver.username}` })
      .setThumbnail(sender.displayAvatarURL())
      .addFields(
        { name: "Sender's New Wallet", value: `${senderCoins}${ECONOMY.CURRENCY}`, inline: true },
        { name: "Receiver's New Wallet", value: `${receiverCoins}${ECONOMY.CURRENCY}`, inline: true },
        { name: "Sender's Net Worth", value: `${senderCoins + senderBank}${ECONOMY.CURRENCY}`, inline: true },
        { name: "Receiver's Net Worth", value: `${receiverCoins + receiverBank}${ECONOMY.CURRENCY}`, inline: true }
      );

    return { embeds: [embed] };
  } catch (err) {
    console.error(`❌ Transfer error for ${sender.id} to ${receiver.id} in server ${serverId}:`, err);
    return "There was an error processing the transfer. Please try again later.";
  }
};
