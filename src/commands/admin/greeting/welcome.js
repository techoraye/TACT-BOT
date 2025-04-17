const { isHex } = require("@helpers/Utils");
const { buildGreeting } = require("@handlers/greeting");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

async function resetSettings(settings) {
  settings.welcome = {
    enabled: false,
    channel: null,
    embed: {
      description: "",
      thumbnail: false,
      color: "#FFFFFF",
      footer: "",
      image: ""
    }
  };
  await settings.save();
  return "Welcome settings have been reset to default!";
}

async function sendPreview(settings, member) {
  if (!settings.welcome?.enabled) return "Welcome message not enabled in this server";

  const targetChannel = member.guild.channels.cache.get(settings.welcome.channel);
  if (!targetChannel) return "No channel is configured to send welcome message";

  const response = await buildGreeting(member, "WELCOME", settings.welcome);
  await targetChannel.safeSend(response);

  return `Sent welcome preview to ${targetChannel.toString()}`;
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON";
  settings.welcome.enabled = enabled;
  await settings.save();
  return `Configuration saved! Welcome message ${enabled ? "enabled" : "disabled"}`;
}

async function setChannel(settings, channel) {
  if (!channel.canSendEmbeds()) {
    return (
      "Ugh! I cannot send greeting to that channel? I need the `Write Messages` and `Embed Links` permissions in " +
      channel.toString()
    );
  }
  settings.welcome.channel = channel.id;
  await settings.save();
  return `Configuration saved! Welcome message will be sent to ${channel ? channel.toString() : "Not found"}`;
}

async function setDescription(settings, desc) {
  settings.welcome.embed.description = desc;
  await settings.save();
  return "Configuration saved! Welcome message updated";
}

async function setThumbnail(settings, status) {
  settings.welcome.embed.thumbnail = status.toUpperCase() === "ON";
  await settings.save();
  return "Configuration saved! Welcome message updated";
}

async function setColor(settings, color) {
  settings.welcome.embed.color = color;
  await settings.save();
  return "Configuration saved! Welcome message updated";
}

async function setFooter(settings, content) {
  settings.welcome.embed.footer = content;
  await settings.save();
  return "Configuration saved! Welcome message updated";
}

async function setImage(settings, url) {
  settings.welcome.embed.image = url;
  await settings.save();
  return "Configuration saved! Welcome message updated";
}

module.exports = {
  name: "welcome",
  description: "setup welcome message",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      { trigger: "reset", description: "reset welcome message settings to default" },
      { trigger: "preview", description: "preview the configured welcome message" },
      { trigger: "status <on|off>", description: "enable or disable welcome message" },
      { trigger: "channel <#channel>", description: "configure welcome message" },
      { trigger: "desc <text>", description: "set embed description" },
      { trigger: "thumbnail <ON|OFF>", description: "enable/disable embed thumbnail" },
      { trigger: "color <hexcolor>", description: "set embed color" },
      { trigger: "footer <text>", description: "set embed footer content" },
      { trigger: "image <url>", description: "set embed image" }
    ]
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      { name: "reset", description: "reset welcome message settings to default", type: ApplicationCommandOptionType.Subcommand },
      { name: "preview", description: "preview the configured welcome message", type: ApplicationCommandOptionType.Subcommand },
      { name: "status", description: "enable or disable welcome message", type: ApplicationCommandOptionType.Subcommand, options: [
          { name: "status", description: "enabled or disabled", required: true, type: ApplicationCommandOptionType.String, choices: [
              { name: "ON", value: "ON" },
              { name: "OFF", value: "OFF" }
            ]
          }
        ]
      },
      { name: "channel", description: "set welcome channel", type: ApplicationCommandOptionType.Subcommand, options: [
          { name: "channel", description: "channel name", type: ApplicationCommandOptionType.Channel, channelTypes: [ChannelType.GuildText], required: true }
        ]
      }
    ]
  },
  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    const settings = data.settings;
    let response;

    if (type === "reset") {
      response = await resetSettings(settings);
    } else if (type === "preview") {
      response = await sendPreview(settings, message.member);
    } else if (type === "status") {
      response = await setStatus(settings, args[1]?.toUpperCase());
    } else if (type === "channel") {
      response = await setChannel(settings, message.mentions.channels.first());
    } else {
      response = "Invalid command usage!";
    }
    return message.safeReply(response);
  },
  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;
    let response;

    if (sub === "reset") {
      response = await resetSettings(settings);
    } else if (sub === "preview") {
      response = await sendPreview(settings, interaction.member);
    } else if (sub === "status") {
      response = await setStatus(settings, interaction.options.getString("status"));
    } else if (sub === "channel") {
      response = await setChannel(settings, interaction.options.getChannel("channel"));
    } else {
      response = "Invalid subcommand";
    }

    return interaction.followUp(response);
  }
};