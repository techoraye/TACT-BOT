const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS, ECONOMY } = require("@root/config.js");
const { readData, writeData } = require("@helpers/economy");
const path = require("path");

const dataPath = path.join(__dirname, "../../data.json");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "gamble",
  description: "gamble your coins",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<amount>",
    aliases: ["bet"],
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "amount",
        description: "the amount of coins to gamble",
        type: 3, // STRING
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const amount = args[0];
    const response = await gamble(message.author, amount, message.guild.id);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const amount = interaction.options.getString("amount");
    const response = await gamble(interaction.user, amount, interaction.guild.id);
    await interaction.followUp(response);
  },
};

async function gamble(user, amountArg, serverId) {
  const data = await readData();

  // Ensure the servers data structure exists
  if (!data.servers) {
    data.servers = {};
  }

  // Ensure the specific server exists
  if (!data.servers[serverId]) {
    data.servers[serverId] = { users: {} };
  }

  // Initialize user data for this server if not exists
  if (!data.servers[serverId].users[user.id]) {
    data.servers[serverId].users[user.id] = {
      coins: 0,
      bank: 0,
      daily: {
        streak: 0,
        timestamp: null,
      },
    };
  }

  const userDb = data.servers[serverId].users[user.id];
  const coins = userDb.coins;

  // Handle 'all' or 'half'
  let amount;
  if (amountArg.toLowerCase() === "all") {
    amount = coins;
  } else if (amountArg.toLowerCase() === "half") {
    amount = Math.floor(coins / 2);
  } else {
    amount = parseInt(amountArg, 10);
    if (isNaN(amount) || amount < 1) return "Please provide a valid amount to gamble.";
  }

  if (amount > coins) return "You don't have enough coins to gamble that much!";
  if (amount <= 0) return "You must gamble more than 0 coins.";

  // Win or lose logic
  const win = Math.random() < 0.5;
  const resultAmount = amount;

  let description;
  if (win) {
    userDb.coins += resultAmount;
    description = `You gambled ${amount}${ECONOMY.CURRENCY} and **won** 🎉\n` +
                  `You now have **${userDb.coins}${ECONOMY.CURRENCY}**`;
  } else {
    userDb.coins -= resultAmount;
    description = `You gambled ${amount}${ECONOMY.CURRENCY} and **lost** 😢\n` +
                  `You now have **${userDb.coins}${ECONOMY.CURRENCY}**`;
  }

  // Write the updated data back to the file
  try {
    await writeData(data);
    console.log("Data saved successfully!");
  } catch (error) {
    console.error("Error saving data:", error);
  }

  // Create an embed to show the result
  const embed = new EmbedBuilder()
    .setColor(win ? EMBED_COLORS.SUCCESS : EMBED_COLORS.ERROR)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setDescription(description);

  return { embeds: [embed] };
}
