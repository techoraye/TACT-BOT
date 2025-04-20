const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS, ECONOMY, OWNER_IDS } = require("@root/config.js"); // Make sure BOT_OWNERS is defined in your config
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
    const amount = args[0];
    const response = await gamble(message.author, amount, message.guild.id, message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const amount = interaction.options.getString("amount");
    const response = await gamble(interaction.user, amount, interaction.guild.id, interaction);
    await interaction.followUp(response);
  },
};

async function gamble(user, amountArg, serverId, interactionOrMessage) {
  const data = await readData();

  if (!data.servers) data.servers = {};
  if (!data.servers[serverId]) data.servers[serverId] = { users: {} };
  if (!data.servers[serverId].users[user.id]) {
    data.servers[serverId].users[user.id] = {
      coins: 0,
      bank: 0,
      daily: { streak: 0, timestamp: null },
    };
  }

  const userDb = data.servers[serverId].users[user.id];
  const coins = userDb.coins;

  let amount;
  if (amountArg.toLowerCase() === "all") {
    amount = coins;
  } else if (amountArg.toLowerCase() === "half") {
    amount = Math.floor(coins / 2);
  } else {
    amount = parseInt(amountArg, 10);
    if (isNaN(amount) || amount < 1) {
      return "Please provide a valid amount to gamble.";
    }
  }

  if (amount > coins) {
    return "You don't have enough coins to gamble that much!";
  }

  if (amount <= 0) {
    return "You must gamble more than 0 coins.";
  }

  // ⏳ Optional: add cooldown logic here, if desired
  // You can also allow bot owners to skip this, e.g.
  // if (!BOT_OWNERS.includes(user.id)) { checkCooldown() ... }

  const win = Math.random() < 0.5;
  const resultAmount = amount;
  let description;

  if (win) {
    userDb.coins += resultAmount;
    description =
      `🎰 **Jackpot!** 🎉\nYou gambled **${formatNumberWithSuffix(amount)}${ECONOMY.CURRENCY}** and **won**!\n` +
      `🎉 You now have **${formatNumberWithSuffix(userDb.coins)}${ECONOMY.CURRENCY}** in your wallet! 🏆`;
  } else {
    userDb.coins -= resultAmount;
    description =
      `🎰 **Busted!** 😢\nYou gambled **${formatNumberWithSuffix(amount)}${ECONOMY.CURRENCY}** and **lost**.\n` +
      `💸 You now have **${formatNumberWithSuffix(userDb.coins)}${ECONOMY.CURRENCY}** left in your wallet.`;
  }

  await writeData(data);

  const embed = new EmbedBuilder()
    .setColor(win ? EMBED_COLORS.SUCCESS : EMBED_COLORS.ERROR)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setTitle(win ? "🎉 You Won! 🎉" : "💸 You Lost! 💸")
    .setDescription(description)
    .setThumbnail(
      win
        ? "https://freepngclipart.com/download/celebrate/23988-celebrate-png-image.png"
        : "https://as1.ftcdn.net/v2/jpg/09/42/06/42/1000_F_942064271_AKsokfLN9wxTnVUebIM3audReKIpBUfs.jpg"
    )
    .setFooter({ text: win ? "Big Winner!" : "Better Luck Next Time!" })
    .setTimestamp();

  return { embeds: [embed] };
}

function formatNumberWithSuffix(number) {
  const suffixes = ["", "K", "M", "B", "T", "Q", "Qn", "Sx", "Sp", "Oc", "No", "Dc"];
  const tier = Math.floor((Math.log10(number) / 3));
  if (tier === 0) return number.toString();
  const suffix = suffixes[tier] || "";
  const scale = Math.pow(10, tier * 3);
  const scaled = number / scale;
  return `${scaled.toFixed(1)}${suffix}`;
}
