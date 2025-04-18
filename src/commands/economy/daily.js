const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("@root/config.js");
const { writeData, readData } = require("@helpers/economy.js");
const path = require("path");

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

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setDescription(
      `You got ${ECONOMY.DAILY_COINS}${ECONOMY.CURRENCY} as your daily reward\n` +
      `**Updated Balance:** ${userDb.coins}${ECONOMY.CURRENCY}\n` +
      `**Bank Balance:** ${userDb.bank}${ECONOMY.CURRENCY}`
    );

  return { embeds: [embed] };
}

module.exports = {
  name: "daily",
  description: "receive a daily bonus",
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
