const { EmbedBuilder } = require("discord.js");
const saveCountData = require("./saveCountData.js");

module.exports = async function handleCountingMessage(message, countData, serverId) {
  if (!countData[serverId]?.channelId || message.channel.id !== countData[serverId].channelId) return;
  if (message.author.bot) return;

  const content = message.content.trim();
  const number = parseInt(content, 10);

  if (isNaN(number)) return message.delete().catch(() => {});

  // Flag to check if highscore message was already sent
  if (!countData[serverId].highScoreMessageSent) {
    countData[serverId].highScoreMessageSent = false; // Reset when count data is reloaded
  }

  if (number === countData[serverId].lastNumber + 1 && message.author.id !== countData[serverId].lastUserId) {
    countData[serverId].lastNumber = number;
    countData[serverId].lastUserId = message.author.id;

    if (number > countData[serverId].highScore) {
      countData[serverId].highScore = number;
      countData[serverId].highScoreUserId = message.author.id;

      // Always react with "🏅" to new high score
      try {
        await message.react("🏅");
      } catch (err) {
        console.error("Failed to react with 🏅", err);
      }

      // Send high score message only if it hasn't been sent yet
      if (!countData[serverId].highScoreMessageSent) {
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("🏅 New High Score!")
          .setDescription(`**${message.author.tag}** reached the highest count: **${number}**!`)
          .setFooter({ text: `Last valid number was ${countData[serverId].lastNumber}` });

        await message.channel.send({ embeds: [embed] });
        countData[serverId].highScoreMessageSent = true; // Mark the high score message as sent
      }
    } else {
      try {
        await message.react("✔️");
      } catch (err) {
        console.error("Failed to react with ✔️", err);
      }
    }

    try {
      if (typeof saveCountData === "function") {
        saveCountData(countData);
      } else {
        console.error("saveCountData is not a function");
      }
    } catch (err) {
      console.error("Error saving count data:", err);
    }

    return;
  }

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("⛔ Counting Ruined!")
    .setDescription(`**${message.author.tag}** ruined the count at **${number}**. Starting over from 1.\nLast user to ruin the count: <@${countData[serverId].lastUserId}>`)
    .setFooter({ text: `Last valid number was ${countData[serverId].lastNumber}` });

  await message.channel.send({ embeds: [embed] });

  try {
    await message.react("❌");
  } catch (err) {
    console.error("Failed to react with ❌", err);
  }

  countData[serverId].lastNumber = 0;
  countData[serverId].lastUserId = null;
  countData[serverId].highScoreMessageSent = false; // Reset the flag after a ruined count

  try {
    if (typeof saveCountData === "function") {
      saveCountData(countData);
    } else {
      console.error("saveCountData is not a function");
    }
  } catch (err) {
    console.error("Error saving count data:", err);
  }

  message.delete().catch(() => {});
};
