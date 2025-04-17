const fs = require('fs').promises;
const path = require('path');
const dataFilePath = path.resolve(__dirname, '../../data.json'); // Use the correct path pointing to the root of your project

// Ensure the data file exists
async function checkDataFile() {
  try {
    await fs.access(dataFilePath);
  } catch (error) {
    console.error('Data file does not exist. Creating a new one.');
    await fs.writeFile(dataFilePath, JSON.stringify({ servers: {} }, null, 2), 'utf8');
  }
}

// Read data from JSON
async function readData() {
  try {
    await checkDataFile(); // Ensure file exists before reading
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { servers: {} };  // Return empty structure if reading fails
  }
}

// Write data back to JSON
async function writeData(data) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

// Get a specific user's data and initialize if needed
async function getUser(serverId, userId) {
  const data = await readData();

  // Log server and user for debugging
  console.log(`Retrieving user ${userId} in server ${serverId}`);
  
  // Ensure the servers object exists
  if (!data.servers) {
    console.log('Servers object does not exist. Initializing...');
    data.servers = {};  // Initialize the servers object
  }

  // Ensure the server exists
  if (!data.servers[serverId]) {
    console.log(`Server ${serverId} not found. Initializing server...`);
    data.servers[serverId] = { users: {} };
    await writeData(data);  // Write the new server data back to the file
  }

  // Ensure the user exists within the server
  if (!data.servers[serverId].users[userId]) {
    console.log(`User ${userId} not found. Initializing user...`);
    data.servers[serverId].users[userId] = { coins: 0, bank: 0 };
    await writeData(data);  // Write the new user data back to the file
  }

  return data.servers[serverId].users[userId];
}

// Update a user's data with a callback
async function updateUser(serverId, userId, updateCallback) {
  const data = await readData();

  // Initialize server and user if needed
  if (!data.servers[serverId]) {
    data.servers[serverId] = { users: {} };
  }
  if (!data.servers[serverId].users[userId]) {
    throw new Error(`User ${userId} not found in server ${serverId}.`);
  }

  const user = data.servers[serverId].users[userId];
  updateCallback(user);
  
  await writeData(data);  // Ensure data is written back after modification
}

// ECONOMY HELPERS
async function getBalance(userId, serverId) {
  try {
    const user = await getUser(serverId, userId);
    return { coins: user.coins, bank: user.bank };
  } catch (error) {
    console.error(`Error retrieving balance for user ${userId} in server ${serverId}:`, error);
    throw new Error("There was an error retrieving the balance. Please try again later.");
  }
}

async function depositCoins(userId, amount, serverId) {
  if (amount <= 0) throw new Error("Amount to deposit must be greater than 0.");
  
  await updateUser(serverId, userId, (user) => {
    if (user.coins < amount) throw new Error("Not enough coins to deposit.");
    user.coins -= amount;
    user.bank += amount;
  });
  return true;
}

async function withdrawCoins(userId, amount, serverId) {
  if (amount <= 0) throw new Error("Amount to withdraw must be greater than 0.");
  
  await updateUser(serverId, userId, (user) => {
    if (user.bank < amount) throw new Error("Not enough coins in bank to withdraw.");
    user.bank -= amount;
    user.coins += amount;
  });
  return true;
}

async function transferCoins(fromUserId, toUserId, amount, serverId) {
  if (fromUserId === toUserId) throw new Error("Cannot transfer coins to yourself.");
  if (amount <= 0) throw new Error("Amount to transfer must be greater than 0.");
  
  const fromUser = await getUser(serverId, fromUserId);
  const toUser = await getUser(serverId, toUserId);

  if (fromUser.coins < amount) throw new Error("You do not have enough coins to transfer.");

  await updateUser(serverId, fromUserId, (user) => user.coins -= amount);
  await updateUser(serverId, toUserId, (user) => user.coins += amount);

  return true;
}

module.exports = {
  checkDataFile,
  readData,
  writeData,
  getUser,
  updateUser,
  getBalance,
  depositCoins,
  withdrawCoins,
  transferCoins,
};
