const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS, ECONOMY, OWNER_IDS } = require("@root/config.js");
const { readData, writeData } = require("@helpers/economy");
const path = require("path");

const dataPath = path.join(__dirname, "../../database/economy.json");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "work",
  description: "work to earn some coins",
  category: "ECONOMY",
  cooldown: 3600, // 1 hour
  botPermissions: ["EmbedLinks"],

  command: {
    enabled: true,
    aliases: [],
    usage: "",
    minArgsCount: 0,
  },

  slashCommand: {
    enabled: true,
    options: [],
  },

  async messageRun(message) {
    const response = await doWork(message.author, message.guild.id);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await doWork(interaction.user, interaction.guild.id);
    await interaction.followUp(response);
  },
};

async function doWork(user, guildId) {
  const data = await readData();

  // Ensure server & user structure
  if (!data.servers) data.servers = {};
  if (!data.servers[guildId]) data.servers[guildId] = { users: {} };
  if (!data.servers[guildId].users[user.id]) {
    data.servers[guildId].users[user.id] = {
      coins: 0,
      bank: 0,
      daily: { streak: 0, timestamp: null },
      work: { lastUsed: null },
    };
  }

  const userDb = data.servers[guildId].users[user.id];
  const now = Date.now();
  const lastUsed = userDb.work?.lastUsed || 0;
  const cooldown = 3600000; // 1 hour
  const isOwner = OWNER_IDS?.includes(user.id);
  const timeLeft = cooldown - (now - lastUsed);

  if (!isOwner && timeLeft > 0) {
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `⏳ You already worked recently! Try again in **${minutes}m ${seconds}s**.`;
  }

  const jobs = [
    "🧹 cleaned the park",
    "📦 delivered packages",
    "☕ served coffee at a cafe",
    "💻 fixed someone's computer",
    "🎨 painted a mural",
    "📷 took professional photos",
    "🛠️ repaired a broken bicycle",
    "🎸 played music on the street",
    "📚 helped at the local library",
    "🚗 washed some cars"
  ];

  const job = jobs[Math.floor(Math.random() * jobs.length)];

  const min = typeof ECONOMY.WORK_MIN === "number" ? ECONOMY.WORK_MIN : 10;
  const max = typeof ECONOMY.WORK_MAX === "number" ? ECONOMY.WORK_MAX : 100;
  const currency = ECONOMY.CURRENCY ?? "$";

  const amount = Math.floor(Math.random() * (max - min + 1)) + min;
  userDb.coins += amount;
  userDb.work.lastUsed = now;

  await writeData(data);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.SUCCESS || "#00FF00")
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setTitle("💼 You Worked!")
    .setDescription(`${job} and earned **${formatNumberWithSuffix(amount)}${currency}**!`)
    .setFooter({ text: `Wallet: ${formatNumberWithSuffix(userDb.coins)}${currency}` })
    .setTimestamp();

  return { embeds: [embed] };
}

function formatNumberWithSuffix(number) {
  const suffixes = ["", "K", "M", "B", "T", "Q", "Qn", "Sx", "Sp", "Oc", "No", "Dc"];
  if (number < 1000) return number.toString();
  const tier = Math.floor(Math.log10(number) / 3);
  const suffix = suffixes[tier] || "";
  const scale = Math.pow(10, tier * 3);
  const scaled = number / scale;
  return `${scaled.toFixed(1)}${suffix}`;
}
