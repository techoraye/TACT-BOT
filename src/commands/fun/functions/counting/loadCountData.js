const fs = require("fs");
const countingDataPath = "./database/counting.json";

module.exports = function loadCountData() {
  if (fs.existsSync(countingDataPath)) {
    return JSON.parse(fs.readFileSync(countingDataPath, "utf-8"));
  } else {
    const initialData = {};
    fs.writeFileSync(countingDataPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
};
