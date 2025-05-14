const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("@root/config");
const { readData, writeData } = require("@helpers/economy");
const path = require("path");

const dataPath = path.join(__dirname, "../../database/economy.json");

/**
 * Format numbers into compact human-readable strings
 * @param {number} amount
 * @returns {string}
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
  name: "removecoins",
  description: "Remove coins from a user",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<user> <amount>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "The user to remove coins from",
        type: 6, // USER
        required: true,
      },
      {
        name: "amount",
        description: "The amount of coins to remove",
        type: 4, // INTEGER
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.safeReply("❌ You do not have permission to use this command.");
    }

    const target = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;
    const amount = parseInt(args[1], 10);

    if (!target) {
      return message.safeReply("❌ Please mention a valid user.");
    }

    if (isNaN(amount) || amount <= 0) {
      return message.safeReply("❌ Please specify a valid amount of coins.");
    }

    const response = await addRemoveCoins(message.author, target, amount, message.guild.id, "remove");
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.followUp("❌ You do not have permission to use this command.");
    }

    const target = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (!target) {
      return interaction.followUp("❌ Please mention a valid user.");
    }

    if (isNaN(amount) || amount <= 0) {
      return interaction.followUp("❌ Please specify a valid amount of coins.");
    }

    const response = await addRemoveCoins(interaction.user, target, amount, interaction.guild.id, "remove");
    await interaction.followUp(response);
  },
};

/**
 * Add or remove coins from a user's wallet
 */
async function addRemoveCoins(sender, receiver, amount, serverId, action) {
  if (!receiver || receiver.bot) return "❌ Please mention a valid user.";
  if (!amount || isNaN(amount) || amount <= 0) return "❌ Please specify a valid amount of coins.";

  const data = await readData();

  // Ensure server & user structure exists
  if (!data.servers) data.servers = {};
  if (!data.servers[serverId]) data.servers[serverId] = { users: {} };
  if (!data.servers[serverId].users[receiver.id]) {
    data.servers[serverId].users[receiver.id] = {
      coins: 0,
      bank: 0,
      daily: {
        streak: 0,
        timestamp: null,
      },
    };
  }

  // Modify coins
  if (action === "add") {
    data.servers[serverId].users[receiver.id].coins += amount;
  } else if (action === "remove") {
    data.servers[serverId].users[receiver.id].coins -= amount;
  }

  await writeData(data);

  const formattedAmount = formatCurrency(amount);
  const formattedCoins = formatCurrency(data.servers[serverId].users[receiver.id].coins);

  const embedColor =
    typeof EMBED_COLORS?.RED === "string" || typeof EMBED_COLORS?.RED === "number"
      ? EMBED_COLORS.RED
      : "#FF0000"; // fallback red

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setAuthor({ name: sender.username, iconURL: sender.displayAvatarURL() })
    .setDescription(
      `${action === "add" ? "Added" : "Removed"} **${formattedAmount}${ECONOMY.CURRENCY}** ${
        action === "add" ? "to" : "from"
      } **${receiver.username}** 💸`
    )
    .addFields({
      name: "Updated Balance",
      value: `**${receiver.username}** now has **${formattedCoins}${ECONOMY.CURRENCY}** in their wallet.`,
      inline: false,
    })
    .setFooter({ text: "Admin action performed." })
    .setTimestamp();

  return { embeds: [embed] };
}
