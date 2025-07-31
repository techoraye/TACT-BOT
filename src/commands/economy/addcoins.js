const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("@root/config");
const { readData, writeData } = require("@helpers/economy");
const path = require("path");

const dataPath = path.join(__dirname, "../../database/economy.json");

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
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "addcoins",
  description: "add coins to a user",
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
        description: "the user to add coins to",
        type: 6, // USER
        required: true,
      },
      {
        name: "amount",
        description: "the amount of coins to add",
        type: 4, // INTEGER
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    // Check if the user is an admin or has sufficient permissions
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.safeReply("You do not have permission to use this command.");
    }

    const target = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;
    const amount = parseInt(args[1], 10);
    const response = await addRemoveCoins(message.author, target, amount, message.guild.id, "add");
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    // Check if the user is an admin or has sufficient permissions
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.followUp("You do not have permission to use this command.");
    }

    const target = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const response = await addRemoveCoins(interaction.user, target, amount, interaction.guild.id, "add");
    await interaction.followUp(response);
  },
};

async function addRemoveCoins(sender, receiver, amount, serverId, action) {
  if (!receiver || receiver.bot) return "Please mention a valid user to modify coins.";
  if (!amount || isNaN(amount) || amount <= 0) return "Please specify a valid amount of coins to modify.";

  const data = await readData();

  // Ensure the servers data structure exists
  if (!data.servers) {
    data.servers = {};
  }

  // Ensure the specific server exists
  if (!data.servers[serverId]) {
    data.servers[serverId] = { users: {} };
  }

  // Initialize receiver if missing in the specific server context
  if (!data.servers[serverId].users[receiver.id]) {
    data.servers[serverId].users[receiver.id] = {
      coins: 0,  // Start with 0 coins if the user doesn't exist
      bank: 0,
      daily: {
        streak: 0,
        timestamp: null,
      },
    };
  }

  // Modify the coins based on action (add or remove)
  if (action === "add") {
    data.servers[serverId].users[receiver.id].coins += amount;
  } else if (action === "remove") {
    data.servers[serverId].users[receiver.id].coins -= amount;
  }

  // Save the updated data
  await writeData(data);

  // Format the amount to include money prefixes like K, M, B, etc.
  const formattedAmount = formatCurrency(amount);
  const formattedCoins = formatCurrency(data.servers[serverId].users[receiver.id].coins);

  // Create the embed response
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.SUCCESS)
    .setAuthor({ name: sender.username, iconURL: sender.displayAvatarURL() })
    .setDescription(`${action === "add" ? "Added" : "Removed"} **${formattedAmount}${ECONOMY.CURRENCY}** to/from **${receiver.username}** 💸`)
    .addFields(
      {
        name: "Updated Balance",
        value: `**${receiver.username}** now has **${formattedCoins}${ECONOMY.CURRENCY}** in their wallet.`,
        inline: false,
      }
    )
    .setFooter({ text: "Admin action performed." })
    .setTimestamp();

  return { embeds: [embed] };
}
