const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("@root/config");
const { readData, writeData } = require("@helpers/economy");
const path = require("path");

const dataPath = path.join(__dirname, "../../database/economy.json");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "setcoins",
  description: "set coins for a user",
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
        description: "the user to set coins for",
        type: 6, // USER
        required: true,
      },
      {
        name: "amount",
        description: "the amount of coins to set",
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
    const response = await setCoins(message.author, target, amount, message.guild.id);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    // Check if the user is an admin or has sufficient permissions
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.followUp("You do not have permission to use this command.");
    }

    const target = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const response = await setCoins(interaction.user, target, amount, interaction.guild.id);
    await interaction.followUp(response);
  },
};

async function setCoins(sender, receiver, amount, serverId) {
  if (!receiver || receiver.bot) return "Please mention a valid user to modify coins.";
  if (!amount || isNaN(amount) || amount < 0) return "Please specify a valid amount of coins to set.";

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

  // Set the coins to the specified amount
  data.servers[serverId].users[receiver.id].coins = amount;

  // Save the updated data
  await writeData(data);

  // Create the embed response with yellow color
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.YELLOW) // Yellow color for setting coins
    .setAuthor({ name: sender.username, iconURL: sender.displayAvatarURL() })
    .setDescription(`You have set **${receiver.username}**'s coins to **${amount}${ECONOMY.CURRENCY}**.`);

  return { embeds: [embed] };
}
