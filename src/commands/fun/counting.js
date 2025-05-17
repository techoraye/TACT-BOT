const { ChannelType } = require("discord.js");
const path = require("path");
const fs = require("fs");

const loadCountData = require("./functions/counting/loadCountData");
const saveCountData = require("./functions/counting/saveCountData");
const initializeServerData = require("./functions/counting/initializeServerData");
const handleCountingMessage = require("./functions/counting/handleCountingMessage");

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
    usage: "<set/reset>",
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
    ],
  },

  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    const serverId = message.guild.id;

    initializeServerData(serverId, countData);

    if (sub === "set") {
      const channel = message.mentions.channels.first();
      if (!channel || channel.type !== ChannelType.GuildText) {
        return message.safeReply("❌ Please mention a valid text channel.");
      }

      countData[serverId].channelId = channel.id;
      countData[serverId].lastNumber = 0;
      countData[serverId].lastUserId = null;

      saveCountData(countData);
      return message.safeReply(`✅ Counting channel has been set to ${channel}`);
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
      return message.safeReply("🔁 Counting system has been reset.");
    }

    return message.safeReply("❌ Invalid subcommand. Use `set` or `reset`.");
  },

  async interactionRun(interaction) {
    const serverId = interaction.guild.id;

    try {
      // Only defer if not already replied or deferred
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
      }

      const sub = interaction.options.getSubcommand();
      initializeServerData(serverId, countData);

      if (sub === "set") {
        const channel = interaction.options.getChannel("channel");
        countData[serverId].channelId = channel.id;
        countData[serverId].lastNumber = 0;
        countData[serverId].lastUserId = null;

        saveCountData(countData);
        return interaction.followUp(`✅ Counting channel has been set to ${channel}`);
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
        return interaction.followUp("🔁 Counting system has been reset.");
      }

      return interaction.followUp("❌ Invalid subcommand.");
    } catch (err) {
      console.error("Interaction error:", err);
      // Always use followUp if already replied or deferred
      if (interaction.deferred || interaction.replied) {
        return interaction.followUp({ content: "❌ An error occurred while executing the command.", flags: 64 });
      } else {
        return interaction.reply({ content: "❌ An error occurred while executing the command.", flags: 64 });
      }
    }
  },

  countingMessageHandler: async function (message) {
    const serverId = message.guild.id;
    initializeServerData(serverId, countData);
    await handleCountingMessage(message, countData, serverId);
  },
};