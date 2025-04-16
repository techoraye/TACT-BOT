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
    enabled: true,
    usage: "<amount> [@user]",
    minArgsCount: 1,
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

  async messageRun(message, args) {
    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.safeReply("Please provide a number between 1 and 100.");
    }

    const user = message.mentions.users.first();

    try {
      const deleted = await fetchAndDelete(message.channel, amount, user);
      const response = buildSuccessResponse(deleted);
      const sent = await message.channel.send(response);
      setTimeout(() => sent.delete().catch(() => {}), 3000);

      // delete user's command message
      await message.delete().catch(() => {});
    } catch (ex) {
      const response = buildErrorResponse(ex);
      const sent = await message.channel.send(response);
      setTimeout(() => sent.delete().catch(() => {}), 3000);
    }
  },

  async interactionRun(interaction) {
    const amount = interaction.options.getInteger("amount");
    const user = interaction.options.getUser("user");

    try {
      const deleted = await fetchAndDelete(interaction.channel, amount, user);
      const response = buildSuccessResponse(deleted);
      const sent = await interaction.followUp(response);
      setTimeout(() => sent.delete().catch(() => {}), 3000);
    } catch (ex) {
      const response = buildErrorResponse(ex);
      const sent = await interaction.followUp(response);
      setTimeout(() => sent.delete().catch(() => {}), 3000);
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
    .setTimestamp(Date.now());

  return { embeds: [embed] };
}

function buildErrorResponse(error) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "⚠️ Error" })
    .setDescription("```js\n" + error.toString().substring(0, 4000) + "\n```")
    .setColor(EMBED_COLORS.ERROR)
    .setTimestamp(Date.now());

  return { embeds: [embed] };
}
