const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS, OWNER_IDS } = require("@root/config.js");
const { writeData, readData } = require("@helpers/economy.js");

module.exports = {
  name: "search",
  description: "Search a random location to find money",
  category: "ECONOMY",
  cooldown: 18000, // 5 hours
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    const response = await handleSearch(message.author, message.guild.id);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await handleSearch(interaction.user, interaction.guild.id);
    await interaction.followUp(response);
  },

  async cooldownCheck(user) {
    return OWNER_IDS.includes(user.id) ? false : true;
  },
};

async function handleSearch(user, serverId) {
  const data = await readData();

  if (!data.servers) data.servers = {};
  if (!data.servers[serverId]) data.servers[serverId] = { users: {} };

  let userDb = data.servers[serverId].users[user.id];

  if (!userDb) {
    userDb = {
      coins: 0,
      bank: 0,
      daily: { timestamp: null, streak: 0 },
    };
    data.servers[serverId].users[user.id] = userDb;
  }

  if (typeof userDb.coins !== "number") userDb.coins = 0;
  if (typeof userDb.bank !== "number") userDb.bank = 0;

  const locations = [
    "the Dumpster", "an Abandoned House", "a Bus Station", "a Back Alley", "the Supermarket",
    "the Library", "a Gas Station", "a Parking Lot", "the Sewer", "the Park", "a Garage",
    "a Rooftop", "an Old Car", "a Dusty Couch"
  ];

  const min = ECONOMY.MIN_SEARCH_AMOUNT || 50;
  const max = ECONOMY.MAX_SEARCH_AMOUNT || 300;
  const amount = Math.floor(Math.random() * (max - min + 1)) + min;

  const location = locations[Math.floor(Math.random() * locations.length)];
  userDb.coins += amount;

  data.servers[serverId].users[user.id] = userDb;

  try {
    await writeData(data);
  } catch (error) {
    console.error("Failed to write data:", error);
  }

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setTitle("🔍 Search Success!")
    .setDescription(
      `You searched **${location}** and found **${formatCurrency(amount)} ${ECONOMY.CURRENCY}**!\n` +
      `💰 **New Balance:** ${formatCurrency(userDb.coins)} ${ECONOMY.CURRENCY}`
    )
    .setTimestamp();

  return { embeds: [embed] };
}

function formatCurrency(amount) {
  const suffixes = ["", "K", "M", "B", "T", "Q", "Qn", "Sx", "Sp", "Oc", "No", "Dc"];
  const tier = Math.floor(Math.log10(Math.abs(amount)) / 3);
  if (tier === 0) return amount.toString();

  const suffix = suffixes[tier] || `e${tier * 3}`;
  const scale = Math.pow(10, tier * 3);
  const scaled = (amount / scale).toFixed(1);

  return `${scaled}${suffix}`;
}
