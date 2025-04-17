const { getBalance } = require("@helpers/economy");
const { EmbedBuilder } = require("discord.js");
const { ECONOMY, EMBED_COLORS } = require("../../../../config");

/**
 * @param {User} user - The target user
 * @param {string} serverId - The guild ID
 */
module.exports = async (user, serverId) => {
  try {
    const { coins, bank } = await getBalance(user.id, serverId);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "Wallet", value: `${coins}${ECONOMY.CURRENCY}`, inline: true },
        { name: "Bank", value: `${bank}${ECONOMY.CURRENCY}`, inline: true },
        { name: "Net Worth", value: `${coins + bank}${ECONOMY.CURRENCY}`, inline: true }
      );

    return { embeds: [embed] };
  } catch (error) {
    console.error(error);
    return { content: "There was an error retrieving the balance. Please try again later." };
  }
};
