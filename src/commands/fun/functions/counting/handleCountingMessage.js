const { EmbedBuilder } = require("discord.js");
const { saveCountData } = require("./saveCountData");

module.exports = async function handleCountingMessage(message, countData, serverId) {
  if (!countData[serverId].channelId || message.channel.id !== countData[serverId].channelId) return;
  if (message.author.bot) return;

  const content = message.content.trim();
  const number = parseInt(content, 10);

  if (isNaN(number)) return message.delete().catch(() => {});

  if (number === countData[serverId].lastNumber + 1 && message.author.id !== countData[serverId].lastUserId) {
    countData[serverId].lastNumber = number;
    countData[serverId].lastUserId = message.author.id;

    if (number > countData[serverId].highScore) {
      countData[serverId].highScore = number;
      countData[serverId].highScoreUserId = message.author.id;

      try {
        await message.react("🏅");
      } catch (err) {
        console.error("Failed to react with 🏅", err);
      }

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🏅 New High Score!")
        .setDescription(`**${message.author.tag}** reached the highest count: **${number}**!`)
        .setFooter({ text: `Last valid number was ${countData[serverId].lastNumber}` });

      await message.channel.send({ embeds: [embed] });

      saveCountData(countData);
    } else {
      try {
        await message.react("✔️");
      } catch (err) {
        console.error("Failed to react with ✔️", err);
      }
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

  message.delete().catch(() => {});
};
