const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "clear",
  description: "Deletes a specified number of messages, optionally from a specific user.",
  category: "MODERATION",
  botPermissions: ["ManageMessages"],

  command: {
    enabled: false,  // Disable the message command as it's only for slash commands
  },

  slashCommand: {
    enabled: true,
    options: [
      {
        name: "amount",
        description: "Number of messages to delete (1-100)",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
      {
        name: "user",
        description: "Filter messages by user",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const amount = interaction.options.getInteger("amount");
    const user = interaction.options.getUser("user");

    try {
      const deleted = await fetchAndDelete(interaction.channel, amount, user);
      const response = buildSuccessResponse(deleted);

      // Send an embed for the result, but no reply is necessary
      await interaction.followUp(response); // This sends the response
    } catch (ex) {
      const response = buildErrorResponse(ex);
      await interaction.followUp(response); // Send the error response
    }
  },
};

async function fetchAndDelete(channel, amount, user) {
  const messages = await channel.messages.fetch({ limit: 100 });
  let filtered = messages.filter(msg => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000); // 14 days

  if (user) {
    filtered = filtered.filter(msg => msg.author.id === user.id);
  }

  const toDelete = filtered.first(amount);
  const deleted = await channel.bulkDelete(toDelete, true);
  return deleted.size;
}

function buildSuccessResponse(count) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "🗑️ Messages Deleted" })
    .setDescription(`Successfully deleted **${count}** messages.`)
    .setColor("Green")
    .setTimestamp();

  return { embeds: [embed] };
}

function buildErrorResponse(error) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "⚠️ Error" })
    .setDescription("```js\n" + error.toString().substring(0, 4000) + "\n```")
    .setColor(EMBED_COLORS.ERROR)
    .setTimestamp();

  return { embeds: [embed] };
}
