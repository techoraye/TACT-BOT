const fs = require("fs");
const countingDataPath = require("./countingDataPath");

function loadCountData() {
  try {
    const raw = fs.readFileSync(countingDataPath, "utf8");
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load counting data:", err);
    return {};
  }
}

module.exports = loadCountData;
