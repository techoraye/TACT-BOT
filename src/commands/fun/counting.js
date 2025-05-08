const { EmbedBuilder, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const path = require("path");
const fs = require("fs");

const loadCountData = require("./functions/counting/loadCountData");
const saveCountData = require("./functions/counting/saveCountData");
const initializeServerData = require("./functions/counting/initializeServerData");
const handleCountingMessage = require("./functions/counting/handleCountingMessage");
const updateHighScore = require("./functions/counting/updateHighScore");

const countingDataPath = "./database/counting.json";
const countingDirPath = path.dirname(countingDataPath);

if (!fs.existsSync(countingDirPath)) {
  fs.mkdirSync(countingDirPath, { recursive: true });
}

let countData = loadCountData();

module.exports = {
  name: "counting",
  description: "Setup or manage the counting system",
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions"],
  command: {
    enabled: true,
    usage: "<set/reset/leaderboard>",
    aliases: [],
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "set",
        description: "Set a channel for counting",
        type: 1,
        options: [
          {
            name: "channel",
            description: "Channel to use for counting",
            type: 7, 
            required: true,
            channel_types: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "reset",
        description: "Reset the counting system",
        type: 1,
      },
      {
        name: "leaderboard",
        description: "Display the counting leaderboard",
        type: 1,
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();
    const serverId = message.guild.id;

    initializeServerData(serverId, countData);

    if (sub === "set") {
      const channel = message.mentions.channels.first();
      if (!channel) return message.safeReply("Please mention a valid text channel.");
      countData[serverId].channelId = channel.id;
      countData[serverId].lastNumber = 0;
      countData[serverId].lastUserId = null;

      saveCountData(countData);

      return message.safeReply(`Counting channel has been set to ${channel}`);
    }

    if (sub === "reset") {
      countData[serverId] = {
        channelId: null,
        lastNumber: 0,
        lastUserId: null,
        highScoreUserId: null,
        highScore: 0,
      };
      saveCountData(countData);
      return message.safeReply("Counting system has been reset.");
    }

    if (sub === "leaderboard") {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.info)
        .setTitle("Counting Leaderboard")
        .setDescription(`Highest count: **${countData[serverId].highScore}** by <@${countData[serverId].highScoreUserId}>`);

      return message.safeReply({ embeds: [embed] });
    }

    return message.safeReply("Invalid subcommand. Use `set`, `reset`, or `leaderboard`.");
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    const serverId = interaction.guild.id;

    initializeServerData(serverId, countData);

    if (sub === "set") {
      const channel = interaction.options.getChannel("channel");
      countData[serverId].channelId = channel.id;
      countData[serverId].lastNumber = 0;
      countData[serverId].lastUserId = null;

      saveCountData(countData);

      return interaction.followUp(`Counting channel has been set to ${channel}`);
    }

    if (sub === "reset") {
      countData[serverId] = {
        channelId: null,
        lastNumber: 0,
        lastUserId: null,
        highScoreUserId: null,
        highScore: 0,
      };
      saveCountData(countData);
      return interaction.followUp("Counting system has been reset.");
    }

    if (sub === "leaderboard") {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.info)
        .setTitle("Counting Leaderboard")
        .setDescription(`Highest count: **${countData[serverId].highScore}** by <@${countData[serverId].highScoreUserId}>`);

      return interaction.followUp({ embeds: [embed] });
    }
  },

  countingMessageHandler: async function (message) {
    const serverId = message.guild.id;
    initializeServerData(serverId, countData);
    await handleCountingMessage(message, countData, serverId);
  },
};
