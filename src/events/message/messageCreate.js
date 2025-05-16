const { commandHandler, automodHandler } = require("@src/handlers");
const { PREFIX_COMMANDS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;

  const settings = await getSettings(message.guild);

  // Command handler
  let isCommand = false;
  if (PREFIX_COMMANDS.ENABLED) {
     // Respond to direct bot mentions at the start of the message
     const mentionRegex = new RegExp(`^<@!?${client.user.id}>`);
     if (mentionRegex.test(message.content.trim())) {
      const { EmbedBuilder } = require("discord.js");
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("TACT Information")
            .setDescription([
        `**Prefix:** \`${settings.prefix}\``,
        `**Mention:** <@${client.user.id}>`,
        `**Bot:** ${client.user.tag}`,
        "",
        `Type \`/help\` to see all commands!`
      ].join("\n"))
      .setFooter({ text: `TACT • Powered by TACT Team`, iconURL: client.user.displayAvatarURL() })
      .setTimestamp();
    return message.channel.safeSend({ embeds: [embed] });
  }

    if (message.content && message.content.startsWith(settings.prefix)) {
      const invoke = message.content.replace(`${settings.prefix}`, "").split(/\s+/)[0];
      const cmd = client.getCommand(invoke);
      if (cmd) {
        isCommand = true;
        commandHandler.handlePrefixCommand(message, cmd, settings);
      }
    }
  }

  // Automod handler
  if (!isCommand) {
    await automodHandler.performAutomod(message, settings);
  }
};
