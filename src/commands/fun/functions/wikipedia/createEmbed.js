// src/commands/fun/functions/wikipedia/createEmbed.js
const { EmbedBuilder } = require('discord.js');

module.exports = (title, description) => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: `Information from Wikipedia - ${new Date().toLocaleString()}` });
};