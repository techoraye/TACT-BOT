module.exports = async function (interaction, serverId, countData, saveCountData) {
    countData[serverId] = {
      channelId: null,
      lastNumber: 0,
      lastUserId: null,
      highScoreUserId: null,
      highScore: 0,
    };
    saveCountData(countData);
    return interaction.followUp("Counting system has been reset.");
  };
  