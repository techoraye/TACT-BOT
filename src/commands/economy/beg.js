const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("@root/config.js");
const { writeData, readData } = require("@helpers/economy.js");

module.exports = {
  name: "beg",
  description: "beg from someone",
  category: "ECONOMY",
  cooldown: 21600,
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
};

async function beg(user, serverId) {
  const data = await readData();

  if (!data.servers) {
    data.servers = {};
  }

  if (!data.servers[serverId]) {
    data.servers[serverId] = { users: {} };
  }

  let userDb = data.servers[serverId].users[user.id];

  if (!userDb) {
    userDb = {
      coins: 0,
      bank: 0,
      daily: { timestamp: null, streak: 0 },
    };

    // Save immediately after creating user
    data.servers[serverId].users[user.id] = userDb;
  }

  // Ensure default values
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

  // Always update the data after any modification
  data.servers[serverId].users[user.id] = userDb;

  const dataFilePath = require("path").resolve(__dirname, "../../database/economy.json");
  console.log(`Writing data to file at: ${dataFilePath}`);

  try {
    await writeData(data);
    console.log("Data saved successfully!");
  } catch (error) {
    console.error("Error saving data:", error);
  }

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setDescription(
      `**${donors[Math.floor(Math.random() * donors.length)]}** donated you **${amount}** ${ECONOMY.CURRENCY}\n` +
      `**Updated Balance:** **${userDb.coins}** ${ECONOMY.CURRENCY}`
    );

  return { embeds: [embed] };
}
