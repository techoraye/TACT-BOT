const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.slashCommands = client.slashCommands || new Map();
  client.slashCommands.clear(); // Reset previous commands if reloading

  const slashCommands = [];
  const commandsPath = path.resolve(__dirname, "../commands");

  // Helper function to recursively read files from subfolders
  const readCommands = (folderPath) => {
    const commandFiles = fs.readdirSync(folderPath);

    for (const file of commandFiles) {
      const fullPath = path.join(folderPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // If it's a directory, recursively read its contents
        readCommands(fullPath);
      } else if (file.endsWith('.js')) {
        const command = require(fullPath);

        if (!command.name || !command.slashCommand || !command.slashCommand.enabled) continue;

        slashCommands.push({
          name: command.name,
          description: command.description || 'No description',
          options: command.slashCommand.options || [],
        });

        client.slashCommands.set(command.name, command);
      }
    }
  };

  // Start reading the commands directory
  readCommands(commandsPath);

  return slashCommands;
};
