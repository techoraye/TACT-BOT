module.exports = function updateHighScore(message, countData, serverId, number) {
    countData[serverId].highScore = number;
    countData[serverId].highScoreUserId = message.author.id;
  
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("🏅 New High Score!")
      .setDescription(`**${message.author.tag}** reached the highest count: **${number}**!`)
      .setFooter({ text: `Last valid number was ${countData[serverId].lastNumber}` });
  
    return embed;
  };
  