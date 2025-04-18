const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("../../../../config");
const { writeData, readData } = require("@helpers/economy");
const path = require("path");

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
 * @param {User} user - The target user
 * @param {string} serverId - The guild ID
 */
async function daily(user, serverId) {
  const data = await readData();

  if (!data.servers) data.servers = {};
  if (!data.servers[serverId]) data.servers[serverId] = { users: {} };
  if (!data.servers[serverId].users) data.servers[serverId].users = {};

  let userDb = data.servers[serverId].users[user.id];

  // If the user entry doesn't exist, create and immediately save it
  if (!userDb) {
    userDb = {
      coins: 0,
      bank: 0,
      daily: { timestamp: null, streak: 0 },
    };
    data.servers[serverId].users[user.id] = userDb;

    // Save the initialized data
    await writeData(data);
  }

  // Ensure daily object exists
  if (!userDb.daily) userDb.daily = { timestamp: null, streak: 0 };

  let streak = userDb.daily.streak || 0;

  if (userDb.daily.timestamp) {
    const lastUpdated = new Date(userDb.daily.timestamp);
    const difference = (new Date() - lastUpdated) / (1000 * 60 * 60); // in hours

    if (difference < 24) {
      const nextUsage = lastUpdated.setHours(lastUpdated.getHours() + 24);
      const msRemaining = nextUsage - new Date();
      const totalSeconds = Math.floor(msRemaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return `You can again run this command in \`${hours} hours ${minutes} minutes ${seconds} seconds\``;
    }

    if (difference < 48) streak += 1;
    else streak = 0;
  }

  userDb.daily.streak = streak;
  userDb.coins += ECONOMY.DAILY_COINS;
  userDb.bank += ECONOMY.DAILY_COINS;
  userDb.daily.timestamp = new Date();

  // Save updated data
  await writeData(data);

  const formattedCoins = formatCurrency(userDb.coins);
  const formattedBank = formatCurrency(userDb.bank);
  const formattedNetWorth = formatCurrency(userDb.coins + userDb.bank);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(`💰 ${user.username}'s Daily Reward`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      {
        name: "🪙 Wallet",
        value: `\`\`\`${formattedCoins}${ECONOMY.CURRENCY}\`\`\``,
        inline: true,
      },
      {
        name: "🏦 Bank",
        value: `\`\`\`${formattedBank}${ECONOMY.CURRENCY}\`\`\``,
        inline: true,
      },
      {
        name: "📊 Net Worth",
        value: `\`\`\`${formattedNetWorth}${ECONOMY.CURRENCY}\`\`\``,
        inline: false,
      }
    )
    .setFooter({ text: `📅 Streak: ${streak} days` })
    .setTimestamp();

  return { embeds: [embed] };
}

module.exports = {
  name: "daily",
  description: "Receive your daily bonus and view your current streak.",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],
  command: { enabled: true },
  slashCommand: { enabled: true },

  async messageRun(message, args) {
    const response = await daily(message.author, message.guild.id);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await daily(interaction.user, interaction.guild.id);
    await interaction.followUp(response);
  },
};
