const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { EMBED_COLORS } = require("@root/config.js");

const dataPath = path.join(__dirname, "../../data.json");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "note",
  description: "Add, view, or clear your personal note",
  category: "UTILITY",
  aliases: ["mynote", "notes"],

  command: {
    enabled: true,
    usage: "<add/view/clear> [note text]",
    minArgsCount: 1,
  },

  slashCommand: {
    enabled: true,
    options: [
      {
        name: "action",
        description: "Action to perform",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Add Note", value: "add" },
          { name: "View Note", value: "view" },
          { name: "Clear Note", value: "clear" },
        ],
      },
      {
        name: "text",
        description: "Note text (only for adding)",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  /**
   * Message Command
   */
  messageRun: async (message, args) => {
    const action = args[0]?.toLowerCase();
    const noteText = args.slice(1).join(" ");

    handleNoteAction(message.author.id, action, noteText, (embed) => {
      message.safeReply({ embeds: [embed] });
    });
  },

  /**
   * Slash Command
   */
  interactionRun: async (interaction) => {
    const action = interaction.options.getString("action");
    const noteText = interaction.options.getString("text") || "";

    handleNoteAction(interaction.user.id, action, noteText, (embed) => {
      interaction.followUp({ embeds: [embed] });
    });
  },
};

/**
 * Handles note actions (add/view/clear)
 */
function handleNoteAction(userId, action, noteText, sendEmbed) {
  const data = readData();

  switch (action) {
    case "add":
      if (!noteText) {
        return sendEmbed(errorEmbed("❌ Please provide the note text to add."));
      }
      data.notes = data.notes || {};
      data.notes[userId] = noteText;
      writeData(data);
      sendEmbed(successEmbed("✅ Note saved successfully!"));
      break;

    case "view":
      const note = data.notes?.[userId];
      if (note) {
        sendEmbed(viewEmbed(note));
      } else {
        sendEmbed(errorEmbed("❌ You don't have any note saved."));
      }
      break;

    case "clear":
      if (data.notes?.[userId]) {
        delete data.notes[userId];
        writeData(data);
        sendEmbed(successEmbed("✅ Your note has been cleared."));
      } else {
        sendEmbed(errorEmbed("❌ You don't have any note to clear."));
      }
      break;

    default:
      sendEmbed(errorEmbed("❌ Invalid action. Use `add`, `view`, or `clear`."));
  }
}

function readData() {
  if (!fs.existsSync(dataPath)) return {};
  const jsonData = fs.readFileSync(dataPath);
  return JSON.parse(jsonData);
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function successEmbed(message) {
  return new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(message);
}

function errorEmbed(message) {
  return new EmbedBuilder().setColor("Red").setDescription(message);
}

function viewEmbed(note) {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle("📝 Your Note")
    .setDescription(note);
}
