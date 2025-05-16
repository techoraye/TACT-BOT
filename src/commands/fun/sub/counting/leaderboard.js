module.exports = async function (interaction, serverId, countData) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.info)
      .setTitle("Counting Leaderboard")
      .setDescription(`Highest count: **${countData[serverId].highScore}** by <@${countData[serverId].highScoreUserId}>`);
    
    return interaction.followUp({ embeds: [embed] });
  };
  