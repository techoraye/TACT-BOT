// src/commands/fun/functions/counting/countingDataPath.js

const path = require("path");

// ✅ Export a string path
module.exports = path.resolve(__dirname, "../../../../../database/counting.json");
