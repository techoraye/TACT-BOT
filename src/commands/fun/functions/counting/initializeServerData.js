module.exports = function initializeServerData(serverId, countData) {
    if (!countData[serverId]) {
      countData[serverId] = {
        channelId: null,
        lastNumber: 0,
        lastUserId: null,
        highScoreUserId: null,
        highScore: 0,
      };
    }
  };
  