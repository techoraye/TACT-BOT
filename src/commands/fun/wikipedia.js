const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
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
        type: 3, // Type 3 is for strings
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

      // Word limit per page
      const wordLimit = 250;
      const words = cleanedContent.split(' ');
      const chunks = [];

      // Split the content into chunks of wordLimit words
      for (let i = 0; i < words.length; i += wordLimit) {
        chunks.push(words.slice(i, i + wordLimit).join(' '));
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
          .setDisabled(chunks.length <= 1)
      );

      // Send the initial message with the embed and buttons
      const sentMessage = await message.reply({ embeds: [embed], components: [row] });

      const filter = (i) => i.user.id === message.author.id && i.customId.startsWith('wiki_page_');
      const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (btnInteraction) => {
        await btnInteraction.deferUpdate();

        const pageNum = parseInt(btnInteraction.customId.split('_')[2]);
        if (pageNum < 0 || pageNum >= chunks.length) return;

        await paginationHandler(btnInteraction, pageNum, chunks, page);
      });

      collector.on('end', () => {
        sentMessage.edit({
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('wiki_page_back').setLabel('Back').setStyle('Secondary').setDisabled(true),
              new ButtonBuilder().setCustomId('wiki_page_next').setLabel('Next').setStyle('Primary').setDisabled(true)
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
    if (!userMessage) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply("Please specify a topic to search.");
      }
      return;
    }

    try {
      const page = await wikipediaAPI(userMessage);
      if (!page || !page.extract) {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply("No information found on that topic.");
        }
        return;
      }

      const cleanedContent = cleanContent(page.extract);

      // Word limit per page
      const wordLimit = 200;
      const words = cleanedContent.split(' ');
      const chunks = [];

      // Split the content into chunks of wordLimit words
      for (let i = 0; i < words.length; i += wordLimit) {
        chunks.push(words.slice(i, i + wordLimit).join(' '));
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
          .setDisabled(chunks.length <= 1)
      );

      // Only defer once
      if (!interaction.replied && !interaction.deferred) {
        await interaction.deferReply();  // Defer if not already done
      }

      // Edit the reply after deferring it
      const sentReply = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      const filter = (i) => i.user.id === interaction.user.id && i.customId.startsWith('wiki_page_');
      const collector = sentReply.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (btnInteraction) => {
        await btnInteraction.deferUpdate();

        const pageNum = parseInt(btnInteraction.customId.split('_')[2]);
        if (pageNum < 0 || pageNum >= chunks.length) return;

        await paginationHandler(btnInteraction, pageNum, chunks, page);
      });

      collector.on('end', () => {
        sentReply.edit({
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('wiki_page_back').setLabel('Back').setStyle('Secondary').setDisabled(true),
              new ButtonBuilder().setCustomId('wiki_page_next').setLabel('Next').setStyle('Primary').setDisabled(true)
            ),
          ],
        });
      });
    } catch (error) {
      console.error("Wikipedia error:", error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply("There was an error retrieving the information.");
      }
    }
  },
};
