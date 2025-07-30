const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("@root/config");
const { readData, writeData } = require("@helpers/economy");

/**
 * Format numbers into compact human-readable strings
 */
function formatCurrency(amount) {
  if (amount === 0) return "0";

  const suffixes = ["", "K", "M", "B", "T", "Q", "Qn", "Sx", "Sp", "Oc", "No", "Dc"];
  const tier = Math.floor(Math.log10(Math.abs(amount)) / 3);
  if (tier === 0) return amount.toString();

  const suffix = suffixes[tier] || `e${tier * 3}`;
  const scale = Math.pow(10, tier * 3);
  const scaled = (amount / scale).toFixed(1);

  return `${scaled}${suffix}`;
}

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "pay",
  description: "Pay another user coins from your wallet",
  category: "ECONOMY",
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "The user you want to pay",
        type: 6, // USER
        required: true,
      },
      {
        name: "amount",
        description: "The amount of coins to pay",
        type: 4, // INTEGER
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const sender = interaction.user;
    const receiver = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const serverId = interaction.guild.id;

    // Basic validation
    if (receiver.bot) return interaction.followUp("❌ You can't pay bots.");
    if (receiver.id === sender.id) return interaction.followUp("❌ You can't pay yourself.");
    if (amount <= 0) return interaction.followUp("❌ Enter a valid amount greater than 0.");

    const data = await readData();

    // Ensure structure
    if (!data.servers) data.servers = {};
    if (!data.servers[serverId]) data.servers[serverId] = { users: {} };
    if (!data.servers[serverId].users[sender.id]) {
      data.servers[serverId].users[sender.id] = { coins: 0, bank: 0, daily: { streak: 0, timestamp: null } };
    }
    if (!data.servers[serverId].users[receiver.id]) {
      data.servers[serverId].users[receiver.id] = { coins: 0, bank: 0, daily: { streak: 0, timestamp: null } };
    }

    const senderCoins = data.servers[serverId].users[sender.id].coins;

    if (senderCoins < amount) {
      return interaction.followUp("❌ You don't have enough coins.");
    }

    // Perform transaction
    data.servers[serverId].users[sender.id].coins -= amount;
    data.servers[serverId].users[receiver.id].coins += amount;
    await writeData(data);

    const formattedAmount = formatCurrency(amount);
    const senderBalance = formatCurrency(data.servers[serverId].users[sender.id].coins);
    const receiverBalance = formatCurrency(data.servers[serverId].users[receiver.id].coins);

    const embedColor =
      typeof EMBED_COLORS?.BLUE === "string" || typeof EMBED_COLORS?.BLUE === "number"
        ? EMBED_COLORS.BLUE
        : "#00BFFF";

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({ name: sender.username, iconURL: sender.displayAvatarURL() })
      .setDescription(`💸 <@${sender.id}> paid <@${receiver.id}> **${formattedAmount}${ECONOMY.CURRENCY}**.`)
      .addFields(
        {
          name: "Your New Balance",
          value: `${senderBalance}${ECONOMY.CURRENCY}`,
          inline: true,
        },
        {
          name: `${receiver.username}'s New Balance`,
          value: `${receiverBalance}${ECONOMY.CURRENCY}`,
          inline: true,
        }
      )
      .setFooter({ text: "Transaction completed" })
      .setTimestamp();

    return interaction.followUp({ embeds: [embed] });
  },
};
