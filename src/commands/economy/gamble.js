const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EMBED_COLORS, ECONOMY } = require("@root/config.js");
const { readData, writeData } = require("@helpers/economy");
const path = require("path");

const dataPath = path.join(__dirname, "../../database/economy.json");

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
    console.log("messageRun triggered");
    const amount = args[0];
    console.log(`Received gamble amount: ${amount}`);
    const response = await gamble(message.author, amount, message.guild.id, message);
    console.log(`Response after gamble: ${response}`);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    console.log("interactionRun triggered");
    const amount = interaction.options.getString("amount");
    console.log(`Received gamble amount: ${amount}`);
    const response = await gamble(interaction.user, amount, interaction.guild.id, interaction);
    console.log(`Response after gamble: ${response}`);
    await interaction.followUp(response);
  },
};

async function gamble(user, amountArg, serverId, interactionOrMessage) {
  console.log("Gamble function triggered");
  console.log(`User: ${user.username} (ID: ${user.id}), Amount: ${amountArg}, ServerID: ${serverId}`);

  // Read data
  const data = await readData();
  console.log("Data loaded:", data);

  // Ensure the servers data structure exists
  if (!data.servers) {
    data.servers = {};
    console.log("Initialized servers data structure");
  }

  // Ensure the specific server exists
  if (!data.servers[serverId]) {
    data.servers[serverId] = { users: {} };
    console.log(`Initialized data for server ID: ${serverId}`);
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
    console.log(`Initialized data for user ID: ${user.id}`);
  }

  const userDb = data.servers[serverId].users[user.id];
  const coins = userDb.coins;
  console.log(`User's current coins: ${coins}`);

  // Handle 'all' or 'half'
  let amount;
  if (amountArg.toLowerCase() === "all") {
    amount = coins;
    console.log("User selected 'all' to gamble");
  } else if (amountArg.toLowerCase() === "half") {
    amount = Math.floor(coins / 2);
    console.log("User selected 'half' to gamble");
  } else {
    amount = parseInt(amountArg, 10);
    console.log(`User entered amount: ${amount}`);
    if (isNaN(amount) || amount < 1) {
      console.log("Invalid amount entered");
      return "Please provide a valid amount to gamble.";
    }
  }

  if (amount > coins) {
    console.log("User doesn't have enough coins to gamble");
    return "You don't have enough coins to gamble that much!";
  }
  if (amount <= 0) {
    console.log("User is trying to gamble 0 or negative amount");
    return "You must gamble more than 0 coins.";
  }

  // Log gamble outcome (win/lose)
  const win = Math.random() < 0.5;
  console.log(`Gamble outcome: ${win ? "Win" : "Lose"}`);

  const resultAmount = amount;
  let description;
  if (win) {
    userDb.coins += resultAmount;
    description = `🎰 **Jackpot!** 🎉\nYou gambled **${formatNumberWithSuffix(amount)}${ECONOMY.CURRENCY}** and **won**!\n` +
                  `🎉 You now have **${formatNumberWithSuffix(userDb.coins)}${ECONOMY.CURRENCY}** in your wallet! 🏆`;
  } else {
    userDb.coins -= resultAmount;
    description = `🎰 **Busted!** 😢\nYou gambled **${formatNumberWithSuffix(amount)}${ECONOMY.CURRENCY}** and **lost**.\n` +
                  `💸 You now have **${formatNumberWithSuffix(userDb.coins)}${ECONOMY.CURRENCY}** left in your wallet.`;
  }

  // Write the updated data back to the file
  try {
    await writeData(data);
    console.log("Data saved successfully!");
  } catch (error) {
    console.error("Error saving data:", error);
  }

  // Create an embed to show the result with flashy visuals
  const embed = new EmbedBuilder()
    .setColor(win ? EMBED_COLORS.SUCCESS : EMBED_COLORS.ERROR)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setTitle(win ? "🎉 You Won! 🎉" : "💸 You Lost! 💸")
    .setDescription(description)
    .setThumbnail(win ? "https://freepngclipart.com/download/celebrate/23988-celebrate-png-image.png" : "https://as1.ftcdn.net/v2/jpg/09/42/06/42/1000_F_942064271_AKsokfLN9wxTnVUebIM3audReKIpBUfs.jpg") // Placeholder images
    .setFooter({ text: win ? "Big Winner!" : "Better Luck Next Time!" })
    .setTimestamp();

  console.log("Returning embed response");
  return { embeds: [embed] };
}

function formatNumberWithSuffix(number) {
  const suffixes = ["", "K", "M", "B", "T", "Q", "Qn", "Sx", "Sp", "Oc", "No", "Dc"];
  const tier = Math.floor((Math.log10(number) / 3));
  if (tier === 0) return number;
  const suffix = suffixes[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = number / scale;
  return `${scaled.toFixed(1)}${suffix}`;
}
