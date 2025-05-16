const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../data/users.json");

// Load DB or initialize empty one
function loadDB() {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "{}");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Save to DB
function saveDB(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Get user (creates it if missing)
function getUser(user) {
  const id = user.id || user;
  const db = loadDB();
  if (!db[id]) {
    db[id] = {
      id,
      coins: 0,
      // add other default fields here
    };
    saveDB(db);
  }
  return db[id];
}

// Save one user
function saveUser(userData) {
  const db = loadDB();
  db[userData.id] = userData;
  saveDB(db);
}

module.exports = {
  getUser,
  saveUser,
};
