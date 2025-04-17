const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("@root/config.js");
const { getUser, writeData, readData } = require("@helpers/economy.js"); // Import the economy helpers

/**
 * @type {import("@structures/Command")}
 */
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
    const response = await beg(message.author, message.guild.id); // Pass serverId
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await beg(interaction.user, interaction.guild.id); // Pass serverId
    await interaction.followUp(response);
  },
};

// Main beg function to handle the begging process
async function beg(user, serverId) {
  // Read data from the file
  const data = await readData(); // Read the data from data.json

  // Ensure servers object exists
  if (!data.servers) {
    data.servers = {}; // Initialize servers if it doesn't exist
  }

  // Ensure server exists
  if (!data.servers[serverId]) {
    data.servers[serverId] = { users: {} }; // Initialize the server if it doesn't exist
  }

  // Get the user data from the specific server
  let userDb = data.servers[serverId].users[user.id];

  // Initialize user data if it doesn't exist
  if (!userDb) {
    userDb = {
      coins: 0,
      bank: 0,
      daily: { timestamp: null, streak: 0 }, // Ensure daily data is initialized
    };
  }

  // Ensure the userDb is properly structured
  if (!userDb.coins) {
    userDb.coins = 0; // Initialize coins if missing
  }

  if (!userDb.bank) {
    userDb.bank = 0; // Initialize bank if missing
  }

  // Select a random donor
  const donors = [
    "PewDiePie", "T-Series", "Sans", "RLX", "Pro Gamer 711", "Zenitsu",
    "Jake Paul", "Kaneki Ken", "KSI", "Naruto", "Mr. Beast", "Ur Mom",
    "A Broke Person", "Giyu Tomiaka", "Bejing Embacy", "A Random Asian Mom",
    "Ur Step Sis", "Jin Mori", "Sakura (AKA Trash Can)", "Hammy The Hamster",
    "Kakashi Sensei", "Minato", "Tanjiro", "ZHC", "The IRS", "Joe Mama",
  ];

  // Random amount to beg
  const min = ECONOMY.MIN_BEG_AMOUNT || 10;
  const max = ECONOMY.MAX_BEG_AMOUNT || 100;
  const amount = Math.floor(Math.random() * (max - min + 1)) + min;

  // Update the user's balance
  userDb.coins += amount; // Update the coins balance
  const newBalance = userDb.coins;

  // Save the updated data to the file
  data.servers[serverId].users[user.id] = userDb; // Update the user's data in the server
  const dataFilePath = require("path").resolve(__dirname, "../../data.json");
  console.log(`Writing data to file at: ${dataFilePath}`);

  try {
    // Write the updated data to the file
    await writeData(data);
    console.log("Data saved successfully!");
  } catch (error) {
    console.error("Error saving data:", error);
  }

  // Create an embed to show the donation and the new balance
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setDescription(
      `**${donors[Math.floor(Math.random() * donors.length)]}** donated you **${amount}** ${ECONOMY.CURRENCY}\n` +
      `**Updated Balance:** **${newBalance}** ${ECONOMY.CURRENCY}`
    );

  return { embeds: [embed] };
}
