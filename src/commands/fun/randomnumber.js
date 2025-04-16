// Build by @techarye, @rox, @Utqo
// Team Techarye 
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "randomnumber",
  description: "Generates a random number between two values (supports Infinity)",
  cooldown: 2,
  category: "FUN",
  command: {
    enabled: true,
    usage: "[min] [max]",
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "min",
        description: "Minimum number (default: 1)",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "max",
        description: "Maximum number (default: 999,999 or ∞)",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const minRaw = args[0];
    const maxRaw = args[1];
    const response = generateRandomEmbed(message.author, minRaw, maxRaw);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const minRaw = interaction.options.getString("min");
    const maxRaw = interaction.options.getString("max");
    const response = generateRandomEmbed(interaction.user, minRaw, maxRaw);
    await interaction.followUp(response);
  },
};

const MAX_SAFE = 999999;  // Setting the new maximum to 999,999

function parseNumber(value, fallback) {
  if (!value) return fallback;
  const v = String(value).toLowerCase();
  if (["infinity", "inf", "∞"].includes(v)) return MAX_SAFE;
  const parsed = parseInt(v);
  return isNaN(parsed) ? fallback : parsed;
}

function generateRandomEmbed(user, minRaw, maxRaw) {
  // Default to 1 and 999999 if no values are provided
  let min = parseNumber(minRaw, 1);
  let max = parseNumber(maxRaw, MAX_SAFE);
  
  // Ensure min is always less than or equal to max
  if (min > max) [min, max] = [max, min];

  const random = Math.floor(Math.random() * (max - min + 1)) + min;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setTitle("🎲 Random Number Generator")
    .addFields(
      { name: "Min", value: `\`${min}\``, inline: true },
      { name: "Max", value: max === MAX_SAFE ? "`999,999`" : `\`${max}\``, inline: true },
      { name: "Result", value: `**${random}**`, inline: false }
    )
    .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL() })
    .setTimestamp();

  return { embeds: [embed] };
}
