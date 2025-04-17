const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("@root/config");
const { readData, writeData } = require("@helpers/economy");
const path = require("path");

const dataPath = path.join(__dirname, "../../data.json");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "removecoins",
  description: "remove coins from a user",
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
        description: "the user to remove coins from",
        type: 6, // USER
        required: true,
      },
      {
        name: "amount",
        description: "the amount of coins to remove",
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
    const response = await addRemoveCoins(message.author, target, amount, message.guild.id, "remove");
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    // Check if the user is an admin or has sufficient permissions
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.followUp("You do not have permission to use this command.");
    }

    const target = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const response = await addRemoveCoins(interaction.user, target, amount, interaction.guild.id, "remove");
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

  // Create the embed response with a red color for removal
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.RED) // Red color for removal
    .setAuthor({ name: sender.username, iconURL: sender.displayAvatarURL() })
    .setDescription(`${action === "add" ? "Added" : "Removed"} **${amount}${ECONOMY.CURRENCY}** from **${receiver.username}** 💸`);

  return { embeds: [embed] };
}
