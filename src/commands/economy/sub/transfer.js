const { transferCoins, getBalance } = require("@helpers/economy");
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
 * @param {import("discord.js").User} sender
 * @param {import("discord.js").User} receiver
 * @param {number} coins
 * @param {string} serverId
 */
module.exports = async (sender, receiver, coins, serverId) => {
  try {
    if (isNaN(coins) || coins <= 0) {
      return "🚫 Please enter a valid amount of coins to transfer.";
    }

    await transferCoins(sender.id, receiver.id, coins, serverId);

    const { coins: senderCoins, bank: senderBank } = await getBalance(sender.id, serverId);
    const { coins: receiverCoins, bank: receiverBank } = await getBalance(receiver.id, serverId);

    const formattedSenderCoins = formatCurrency(senderCoins);
    const formattedReceiverCoins = formatCurrency(receiverCoins);
    const formattedSenderNet = formatCurrency(senderCoins + senderBank);
    const formattedReceiverNet = formatCurrency(receiverCoins + receiverBank);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle(`💸 Transfer Successful`)
      .setThumbnail(sender.displayAvatarURL())
      .addFields(
        {
          name: `🪙 Sender's New Wallet`,
          value: `\`\`\`${formattedSenderCoins}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        },
        {
          name: `🪙 Receiver's New Wallet`,
          value: `\`\`\`${formattedReceiverCoins}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        },
        {
          name: `📊 Sender's Net Worth`,
          value: `\`\`\`${formattedSenderNet}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        },
        {
          name: `📊 Receiver's Net Worth`,
          value: `\`\`\`${formattedReceiverNet}${ECONOMY.CURRENCY}\`\`\``,
          inline: true,
        }
      )
      .setFooter({ text: "Your transaction has been successfully processed." })
      .setTimestamp();

    return { embeds: [embed] };
  } catch (err) {
    console.error(`❌ Transfer error for ${sender.id} to ${receiver.id} in server ${serverId}:`, err);
    return "❌ There was an error processing the transfer. Please try again later.";
  }
};
