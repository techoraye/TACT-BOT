const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const cleanContent = require('./functions/wikipedia/cleanContent');
const createEmbed = require('./functions/wikipedia/createEmbed');
const wikipediaAPI = require('./functions/wikipedia/wikipediaAPI');
const paginationHandler = require('./functions/wikipedia/paginationHandler');

module.exports = {
  name: "wikipedia",
  description: "Fetches information from Wikipedia",
  cooldown: 8,
  isPremium: false,
  category: "FUN",
  command: {
    enabled: true,
    aliases: ["askwiki", "wiki", "askwikipedia"],
    usage: "<topic>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "topic",
        description: "Topic to fetch information about from Wikipedia",
        type: 3,
        required: true,
      },
    ],
  },

  messageRun: async (message, args) => {
    const userMessage = args.join(" ");
    if (!userMessage) return message.reply("Please specify a topic to search.");

    try {
      const page = await wikipediaAPI(userMessage);
      if (!page || !page.extract) return message.reply("No information found on that topic.");

      const cleanedContent = cleanContent(page.extract);
      const chunkSize = 1690;
      const chunks = [];

      for (let i = 0; i < cleanedContent.length; i += chunkSize) {
        chunks.push(cleanedContent.substring(i, i + chunkSize));
      }

      const currentPage = 0;
      const embed = createEmbed(page.title, chunks[currentPage]);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`wiki_page_${currentPage - 1}`)
          .setLabel('Back')
          .setStyle('Secondary')
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`wiki_page_${currentPage + 1}`)
          .setLabel('Next')
          .setStyle('Primary')
          .setDisabled(chunks.length <= 1),
        new ButtonBuilder()
          .setCustomId('wiki_close')
          .setLabel('Close')
          .setStyle('Danger')
      );

      const sentMessage = await message.reply({ embeds: [embed], components: [row] });

      const filter = (i) => i.user.id === message.author.id && i.customId.startsWith('wiki_page_') || i.customId === 'wiki_close';
      const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (btnInteraction) => {
        await btnInteraction.deferUpdate();

        if (btnInteraction.customId === 'wiki_close') {
          // Close the interaction (disable all buttons and update the message)
          await btnInteraction.message.edit({
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('wiki_page_back').setLabel('Back').setStyle('Secondary').setDisabled(true),
                new ButtonBuilder().setCustomId('wiki_page_next').setLabel('Next').setStyle('Primary').setDisabled(true),
                new ButtonBuilder().setCustomId('wiki_close').setLabel('Close').setStyle('Danger').setDisabled(true)
              ),
            ],
          });
          return;
        }

        const pageNum = parseInt(btnInteraction.customId.split('_')[2]);
        if (pageNum < 0 || pageNum >= chunks.length) return;

        await paginationHandler(btnInteraction, pageNum, chunks, page);
      });

      collector.on('end', () => {
        sentMessage.edit({
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('wiki_page_back').setLabel('Back').setStyle('Secondary').setDisabled(true),
              new ButtonBuilder().setCustomId('wiki_page_next').setLabel('Next').setStyle('Primary').setDisabled(true),
              new ButtonBuilder().setCustomId('wiki_close').setLabel('Close').setStyle('Danger').setDisabled(true)
            ),
          ],
        });
      });
    } catch (error) {
      console.error("Wikipedia error:", error);
      message.reply("There was an error retrieving the information.");
    }
  },

  interactionRun: async (interaction) => {
    const userMessage = interaction.options.getString("topic");
    if (!userMessage) return interaction.reply("Please specify a topic to search.");

    try {
      const page = await wikipediaAPI(userMessage);
      if (!page || !page.extract) return interaction.reply("No information found on that topic.");

      const cleanedContent = cleanContent(page.extract);
      const chunkSize = 7000;
      const chunks = [];

      for (let i = 0; i < cleanedContent.length; i += chunkSize) {
        chunks.push(cleanedContent.substring(i, i + chunkSize));
      }

      const currentPage = 0;
      const embed = createEmbed(page.title, chunks[currentPage]);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`wiki_page_${currentPage - 1}`)
          .setLabel('Back')
          .setStyle('Secondary')
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`wiki_page_${currentPage + 1}`)
          .setLabel('Next')
          .setStyle('Primary')
          .setDisabled(chunks.length <= 1),
        new ButtonBuilder()
          .setCustomId('wiki_close')
          .setLabel('Close')
          .setStyle('Danger')
      );

      const sentReply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      const filter = (i) => i.user.id === interaction.user.id && i.customId.startsWith('wiki_page_') || i.customId === 'wiki_close';
      const collector = sentReply.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (btnInteraction) => {
        await btnInteraction.deferUpdate();

        if (btnInteraction.customId === 'wiki_close') {
          // Close the interaction (disable all buttons and update the message)
          await btnInteraction.message.edit({
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('wiki_page_back').setLabel('Back').setStyle('Secondary').setDisabled(true),
                new ButtonBuilder().setCustomId('wiki_page_next').setLabel('Next').setStyle('Primary').setDisabled(true),
                new ButtonBuilder().setCustomId('wiki_close').setLabel('Close').setStyle('Danger').setDisabled(true)
              ),
            ],
          });
          return;
        }

        const pageNum = parseInt(btnInteraction.customId.split('_')[2]);
        if (pageNum < 0 || pageNum >= chunks.length) return;

        await paginationHandler(btnInteraction, pageNum, chunks, page);
      });

      collector.on('end', () => {
        sentReply.edit({
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('wiki_page_back').setLabel('Back').setStyle('Secondary').setDisabled(true),
              new ButtonBuilder().setCustomId('wiki_page_next').setLabel('Next').setStyle('Primary').setDisabled(true),
              new ButtonBuilder().setCustomId('wiki_close').setLabel('Close').setStyle('Danger').setDisabled(true)
            ),
          ],
        });
      });
    } catch (error) {
      console.error("Wikipedia error:", error);
      interaction.reply("There was an error retrieving the information.");
    }
  },
};