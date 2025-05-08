const { ApplicationCommandOptionType, ChannelType } = require("discord.js");
const embedSetup = require("./functions/embed/embedSetup");
const embedFieldManager = require("./functions/embed/embedFieldManager");

module.exports = {
  name: "embed",
  description: "send embed message",
  category: "ADMIN",
  userPermissions: ["ManageMessages"],
  command: {
    enabled: true,
    usage: "<#channel>",
    minArgsCount: 1,
    aliases: ["say"],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "channel to send embed",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.reply("Please provide a valid channel");
    if (channel.type !== ChannelType.GuildText



) return message.reply("This command can only be used in text channels.");
await embedSetup(channel, message.member);
},

async interactionRun(interaction) {
const channel = interaction.options.getChannel("channel");
if (channel.type !== ChannelType.GuildText) return interaction.reply("This command can only be used in text channels.");

await embedSetup(channel, interaction.member);
},
};