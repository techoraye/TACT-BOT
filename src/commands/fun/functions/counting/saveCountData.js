const fs = require("fs");
const path = require("path");
const countingDataPath = require("./countingDataPath");

module.exports = function saveCountData(data) {
  try {
    const dir = path.dirname(countingDataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`[saveCountData] Created missing directory: ${dir}`);
    }

    fs.writeFileSync(countingDataPath, JSON.stringify(data, null, 2), "utf8");
    console.log(`[saveCountData] Saved data to ${countingDataPath}`);
  } catch (err) {
    console.error("[saveCountData] Failed to save counting data:", err);
  }
};
