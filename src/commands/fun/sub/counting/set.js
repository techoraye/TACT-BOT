module.exports = async function (interaction, serverId, countData, saveCountData) {
    const channel = interaction.options.getChannel("channel");
    countData[serverId].channelId = channel.id;
    countData[serverId].lastNumber = 0;
    countData[serverId].lastUserId = null;
  
    saveCountData(countData);
  
    return interaction.followUp(`Counting channel has been set to ${channel}`);
  };
  