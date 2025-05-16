const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

const cooldown = new Map(); // userId => timestamp
const spamTracker = new Map(); // userId => [timestamps]

const COOLDOWN_SECONDS = 10;

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "eat",
  description: "sends a random food emoji",
  category: "FUN",
  botPermissions: ["EmbedLinks"],

  command: {
    enabled: true,
    minArgsCount: 0,
  },

  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    if (onCooldown(message.author.id, message)) return;

    const food = getRandomFood();
    const extra = getFunnyResponse(message.author.id);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setDescription(`${message.author.username} is eating ${food} ${extra}`);

    await message.channel.send({ embeds: [embed] });

    if (message.deletable) message.delete().catch(() => {});
  },

  async interactionRun(interaction) {
    if (onCooldown(interaction.user.id, interaction)) return;

    const food = getRandomFood();
    const extra = getFunnyResponse(interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setDescription(`${interaction.user.username} is eating ${food} ${extra}`);

    await interaction.followUp({ embeds: [embed] });
  },
};

function getRandomFood() {
  const foods = [
    "🍕", "🍔", "🌭", "🍟", "🍗", "🥩", "🍖", "🥪", "🍝", "🍜",
    "🍣", "🍤", "🍱", "🍙", "🍚", "🍛", "🍲", "🥘", "🥗", "🍿",
    "🧀", "🥞", "🧇", "🥯", "🥐", "🥖", "🍩", "🍪", "🎂", "🍰",
    "🧁", "🍫", "🍬", "🍭", "🍮", "🍦", "🍨", "🍧"
  ];
  return foods[Math.floor(Math.random() * foods.length)];
}

function onCooldown(userId, source) {
  const now = Date.now();
  const cd = cooldown.get(userId);
  if (cd && now - cd < COOLDOWN_SECONDS * 1000) {
    const timeLeft = ((COOLDOWN_SECONDS * 1000 - (now - cd)) / 1000).toFixed(1);
    const reply = `⏳ You just ate! Wait **${timeLeft}s** before your next bite.`;
    if (source.reply) source.reply(reply).catch(() => {});
    else source.followUp(reply).catch(() => {});
    return true;
  }

  cooldown.set(userId, now);

  // Log usage for Easter eggs
  if (!spamTracker.has(userId)) spamTracker.set(userId, []);
  const timestamps = spamTracker.get(userId);
  timestamps.push(now);

  // Keep only the last 60 seconds
  const filtered = timestamps.filter(t => now - t < 60000);
  spamTracker.set(userId, filtered);

  return false;
}

function getFunnyResponse(userId) {
  const usageCount = spamTracker.get(userId)?.length || 0;

  if (usageCount >= 10) return "💥 bro stop you're gonna explode.";
  if (usageCount >= 8) return "🧠 emotional eating detected.";
  if (usageCount >= 6) return "🥴 you're eating way too much...";
  if (usageCount >= 4) return "⚠️ you're gonna be fat.";
  if (usageCount >= 3) return "🍽️ slow down, this isn't a buffet.";

  return ""; // default, no extra message
}
