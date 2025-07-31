const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const createEmbed = require('./createEmbed');

module.exports = async (interaction, currentPage, chunks, page) => {
  // Clamp page index
  if (currentPage < 0) currentPage = 0;
  if (currentPage >= chunks.length) currentPage = chunks.length - 1;

  const newEmbed = createEmbed(page.title, chunks[currentPage]);

  try {
    // Ensure that the interaction is only deferred or replied once
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply(); // Deferring the reply if it hasn't been done already
    }

    // Now update the interaction with the new embed and components
    await interaction.editReply({
      embeds: [newEmbed],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`wiki_page_${currentPage - 1}`)
            .setLabel('Back')
            .setStyle('Secondary')
            .setDisabled(currentPage <= 0),
          new ButtonBuilder()
            .setCustomId(`wiki_page_${currentPage + 1}`)
            .setLabel('Next')
            .setStyle('Primary')
            .setDisabled(currentPage >= chunks.length - 1),
          new ButtonBuilder()
            .setCustomId('close')
            .setLabel('Close')
            .setStyle('Danger') // Style it as a 'danger' button (usually red)
        ),
      ],
    });
  } catch (err) {
    console.error('Failed to update interaction:', err);
  }
};