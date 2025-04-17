const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config.json');

// Function to read config file
function readConfig() {
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config:', error);
    return null;
  }
}

// Function to write config file
function writeConfig(data) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to config:', error);
  }
}

module.exports = { readConfig, writeConfig };
