const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("@root/config.js");
const { getUser, writeData, readData } = require("@helpers/economy.js"); // Import the economy helpers

// Function to handle the daily reward
async function daily(user, serverId) {
  // Read data from the file
  const data = await readData(); // Read the data from data.json

  // Check if the server exists, if not, initialize it
  if (!data.servers) {
    data.servers = {}; // Initialize servers if it doesn't exist
  }

  if (!data.servers[serverId]) {
    data.servers[serverId] = { users: {} }; // Initialize the server if it doesn't exist
  }

  // Get the user data from the specific server
  let userDb = data.servers[serverId].users[user.id];

  if (!userDb) {
    // Initialize the user's data if not found
    userDb = {
      coins: 0,
      bank: 0,
      daily: { timestamp: null, streak: 0 }, // Ensure daily is initialized
    };
  }

  // Make sure the daily object exists
  if (!userDb.daily) {
    userDb.daily = { timestamp: null, streak: 0 }; // Initialize daily if missing
  }

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

  // Log the data before updating
  console.log(`Before update: User ID: ${user.id}, Server ID: ${serverId}`);
  console.log("User Data:", userDb);

  // Adding the daily reward to the coins and bank balance
  console.log(`Adding ${ECONOMY.DAILY_COINS} to coins and bank for ${user.id}`);
  userDb.coins += ECONOMY.DAILY_COINS;
  userDb.bank += ECONOMY.DAILY_COINS; // Ensure both coins and bank balances are updated

  userDb.daily.timestamp = new Date();

  // Log the data after update
  console.log("After update: User Data:", userDb);

  // Path of the data file
  const dataFilePath = require("path").resolve(__dirname, "../../data.json");
  console.log(`Writing data to file at: ${dataFilePath}`);

  // Save the updated user data
  try {
    // Save the entire data structure back to the file
    await writeData(data);
    console.log("Data saved successfully!");
  } catch (error) {
    console.error("Error saving data:", error);
  }

  // Embed to show the updated balances
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setDescription(
      `You got ${ECONOMY.DAILY_COINS}${ECONOMY.CURRENCY} as your daily reward\n` +
        `**Updated Balance:** ${userDb.coins}${ECONOMY.CURRENCY}\n` + // Display coins balance
        `**Bank Balance:** ${userDb.bank}${ECONOMY.CURRENCY}` // Display bank balance
    );

  return { embeds: [embed] };
}

module.exports = {
  name: "daily",
  description: "receive a daily bonus",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = await daily(message.author, message.guild.id);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await daily(interaction.user, interaction.guild.id);
    await interaction.followUp(response);
  },
};
