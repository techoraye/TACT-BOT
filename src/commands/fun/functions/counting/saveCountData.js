const countingDataPath = "./database/counting.json";

module.exports = function saveCountData(data) {
  fs.writeFileSync(countingDataPath, JSON.stringify(data, null, 2));
};
