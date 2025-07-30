const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS, OWNER_IDS } = require("@root/config.js");
const { writeData, readData } = require("@helpers/economy.js");
const path = require("path");

module.exports = {
  name: "beg",
  description: "beg from someone",
  category: "ECONOMY",
  cooldown: 21600, // applies to non-owners
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    const response = await beg(message.author, message.guild.id);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await beg(interaction.user, interaction.guild.id);
    await interaction.followUp(response);
  },

  // ⛔ Override cooldown for owners
  async cooldownCheck(user) {
    return OWNER_IDS.includes(user.id) ? false : true;
  },
};

async function beg(user, serverId) {
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

  const donors = [
    "PewDiePie", "T-Series", "Sans", "RLX", "Pro Gamer 711", "Zenitsu",
    "Jake Paul", "Kaneki Ken", "KSI", "Naruto", "Mr. Beast", "Ur Mom",
    "A Broke Person", "Giyu Tomiaka", "Bejing Embacy", "A Random Asian Mom",
    "Ur Step Sis", "Jin Mori", "Sakura (AKA Trash Can)", "Hammy The Hamster",
    "Kakashi Sensei", "Minato", "Tanjiro", "ZHC", "The IRS", "Joe Mama",
  ];

  const min = ECONOMY.MIN_BEG_AMOUNT || 10;
  const max = ECONOMY.MAX_BEG_AMOUNT || 100;
  const amount = Math.floor(Math.random() * (max - min + 1)) + min;

  userDb.coins += amount;

  try {
    await writeData(data);
  } catch (error) {
    console.error("Error saving data:", error);
  }

  const currency = ECONOMY.CURRENCY ?? "$";
  const donor = donors[Math.floor(Math.random() * donors.length)];

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setDescription(
      `**${donor}** donated you **${formatCurrency(amount)}${currency}**\n` +
      `**Updated Balance:** **${formatCurrency(userDb.coins)}${currency}**`
    );

  return { embeds: [embed] };
}

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
