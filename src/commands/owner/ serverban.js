const { EmbedBuilder } = require("discord.js"); // Updated to EmbedBuilder

// Import subcommands manually
const add = require("./sub/serverban/add.js");
const remove = require("./sub/serverban/remove.js");
const list = require("./sub/serverban/list.js");

module.exports = {
  name: "serverban",
  description: "Manage blacklisted servers",
  category: "OWNER",
  command: {
    enabled: true,
    usage: "<add|remove|list> [serverId]",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    const sub = args[0];

    // If no subcommand is provided or the subcommand is invalid, show usage
    if (!sub || !['add', 'remove', 'list'].includes(sub)) {
      const usageEmbed = new EmbedBuilder() // Changed to EmbedBuilder
        .setColor('#FF0000') // Red color for error
        .setTitle('Invalid Command Usage')
        .setDescription('Here is how to use the `serverban` command:')
        .addFields(
          { name: 'Command', value: '`serverban <add|remove|list> [serverId]`', inline: false },
          { name: 'Subcommands:', value: '`add`: Add a server to the blacklist\n`remove`: Remove a server from the blacklist\n`list`: List all blacklisted servers', inline: false }
        )
        .setFooter({ text: 'You can also refer to the documentation or use `help serverban` for more info.' });

      return message.reply({ embeds: [usageEmbed] });
    }

    switch (sub) {
      case "add":
        return add.messageRun(message, args);
      case "remove":
        return remove.messageRun(message, args);
      case "list":
        return list.messageRun(message, args);
      default:
        return message.reply("Usage: serverban <add|remove|list> [serverId]");
    }
  }
};
// This command is for managing blacklisted servers. It allows you to add, remove, or list blacklisted servers.
// The command is structured to handle subcommands and provides usage information if the command is not used correctly.