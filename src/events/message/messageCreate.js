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
    // Respond to bot mentions
    if (message.content.includes(`${client.user.id}`)) {
      message.channel.safeSend(`> My prefix is \`${settings.prefix}\``);
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
