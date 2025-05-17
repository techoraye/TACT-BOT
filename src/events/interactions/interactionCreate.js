const {
  commandHandler,
  contextHandler,
  ticketHandler,
} = require("@src/handlers");
const { InteractionType } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').BaseInteraction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.guild) {
    return interaction
      .reply({
        content: "Command can only be executed in a discord server",
        ephemeral: true,
      })
      .catch(() => {});
  }

  // Slash Commands
  if (interaction.isChatInputCommand()) {
    await commandHandler.handleSlashCommand(interaction);
  }

  // Context Menu
  else if (interaction.isContextMenuCommand()) {
    const context = client.contextMenus.get(interaction.commandName);
    if (context)
      await contextHandler.handleContext(interaction, context);
    else
      return interaction
        .reply({ content: "An error has occurred", ephemeral: true })
        .catch(() => {});
  }

  // Buttons
  else if (interaction.isButton()) {
    // Route all ticket-related buttons to the ticket handler
    const ticketButtonIds = [
      "CREATE_TICKET",
      "TICKET_CLOSE",
      "TICKET_TRANSCRIPT",
      "TICKET_LOCK",
      "TICKET_PIN",
      "TICKET_OWNER"
    ];
    if (ticketButtonIds.includes(interaction.customId)) {
      // CREATE_TICKET is the open handler, others go to handleTicketButton
      if (interaction.customId === "CREATE_TICKET") {
        return ticketHandler.handleTicketOpen(interaction);
      } else {
        return ticketHandler.handleTicketButton(interaction);
      }
    }
  }
};