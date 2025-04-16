const axios = require('axios');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js'); // Import necessary components for buttons and embeds

// Wikipedia API URL
const wikipediaAPI = 'https://en.wikipedia.org/w/api.php?';

// Function to clean up the Wikipedia content and remove unnecessary HTML tags
const cleanContent = (content) => {
  return content
    .replace(/<\/?p[^>]*>/g, '')  // Remove <p> and </p> tags
    .replace(/<[^>]+>/g, '')      // Remove any other HTML tags
    .replace(/&quot;/g, '"')      // Replace &quot; with actual quotes
    .replace(/&amp;/g, '&')       // Replace &amp; with &
    .replace(/\n+/g, '\n')        // Remove multiple newline characters
    .trim();                      // Remove any leading or trailing whitespace
};

module.exports = {
  name: "wikipedia",  // Command name
  description: "Fetches information from Wikipedia",  // Command description
  cooldown: 8,  // Cooldown of 5 seconds between uses to prevent spamming
  isPremium: false,  // This is not a premium feature
  category: "FUN",  // The category the command belongs to
  botPermissions: [],  // No special permissions required for the bot
  userPermissions: [],  // No special permissions required for the user
  validations: [],  // No specific validations for this command
  command: {
    enabled: true,  // Command is enabled
    aliases: ["askwiki","wiki","askwikipedia"],  // Aliases for the command
    usage: "<topic>",  // Usage format for the command
    minArgsCount: 1,  // Minimum arguments required (1 topic)
    subcommands: [],  // No subcommands
  },
  slashCommand: {
    enabled: true,  // Slash commands enabled
    ephemeral: false,  // Response is visible to everyone
    options: [
      {
        name: "topic",  // The option for the topic
        description: "Topic to fetch information about from Wikipedia",
        type: 3,  // Type 3 means it's a string
        required: true,  // This option is required
      },
    ],
  },
  messageRun: async (message, args) => {
    const userMessage = args.join(" ");  // Combine arguments to form the topic
    if (!userMessage) {  // If no topic is provided, return an error
      return message.reply("Please specify a topic to get information from Wikipedia.");
    }

    try {
      // Fetch information from Wikipedia API
      const { data } = await axios.get(wikipediaAPI, {
        params: {
          action: 'query',
          format: 'json',
          prop: 'extracts',
          exintro: true,  // Only get the introductory content
          titles: userMessage,  // Topic name to fetch data for
        },
      });

      // Access the page data from the API response
      const page = data.query.pages[Object.keys(data.query.pages)[0]];

      if (page && page.extract) {  // If page data and extract are available
        const cleanedContent = cleanContent(page.extract);  // Clean the content by removing HTML tags

        // Split the cleaned content into chunks of 1000 characters each for pagination
        const chunkSize = 1690;  
        const chunks = [];
        for (let i = 0; i < cleanedContent.length; i += chunkSize) {
          chunks.push(cleanedContent.substring(i, i + chunkSize));
        }

        // Create an embed for the first chunk of content
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)  // Set embed color (blue)
          .setTitle(page.title)  // Set the title of the embed to the Wikipedia page title
          .setDescription(chunks[0])  // Set the description to the first chunk of content
          .setFooter({ text: `Information from Wikipedia - ${new Date().toLocaleString()}` });

        // Create the row of buttons with 'Back' and 'Next' buttons
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('back_chunk')  // Custom ID for 'Back' button
            .setLabel('Back')  // Label of the 'Back' button
            .setStyle('Secondary')  // Set button style to Secondary (default style for Back)
            .setDisabled(true),  // Initially disabled, as it's the first page
          new ButtonBuilder()
            .setCustomId('next_chunk')  // Custom ID for 'Next' button
            .setLabel('Next')  // Label of the 'Next' button
            .setStyle('Primary')  // Set button style to Primary (highlighted)
            .setDisabled(chunks.length <= 1)  // Disable Next button if there's only one chunk
        );

        // Send the embed message with buttons to the user
        const sentMessage = await message.reply({ embeds: [embed], components: [row] });

        let currentPage = 0;  // Keep track of the current page (chunk) the user is viewing

        // Set up a collector to listen for button clicks (pagination)
        const filter = (interaction) => interaction.user.id === message.author.id;  // Only the user who triggered the command can interact
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });  // Collector will listen for interactions for 60 seconds

        collector.on('collect', async (interaction) => {
          if (interaction.customId === 'next_chunk') {  // If Next button is clicked, go to the next chunk
            currentPage++;
          } else if (interaction.customId === 'back_chunk') {  // If Back button is clicked, go to the previous chunk
            currentPage--;
          }

          // Create a new embed with the current chunk
          const newEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(page.title)
            .setDescription(chunks[currentPage])  // Set the description to the current chunk
            .setFooter({ text: `Information from Wikipedia - ${new Date().toLocaleString()}` });

          // Update the message with the new embed and updated buttons
          await interaction.update({
            embeds: [newEmbed],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId('back_chunk')
                  .setLabel('Back')
                  .setStyle('Secondary')
                  .setDisabled(currentPage <= 0),  // Disable the 'Back' button if we're on the first page
                new ButtonBuilder()
                  .setCustomId('next_chunk')
                  .setLabel('Next')
                  .setStyle('Primary')
                  .setDisabled(currentPage >= chunks.length - 1)  // Disable the 'Next' button if we're on the last page
              ),
            ],
          });
        });

        // When the collector ends (either by timeout or user interaction), disable the buttons
        collector.on('end', () => {
          sentMessage.edit({
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId('back_chunk')
                  .setLabel('Back')
                  .setStyle('Secondary')
                  .setDisabled(true),  // Disable Back button when interaction ends
                new ButtonBuilder()
                  .setCustomId('next_chunk')
                  .setLabel('Next')
                  .setStyle('Primary')
                  .setDisabled(true)  // Disable Next button when interaction ends
              ),
            ],
          });
        });
      } else {
        message.reply('Sorry, I couldn\'t find any information on that topic.');  // Handle case where no content is found for the topic
      }
    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      message.reply('There was an error retrieving the information.');  // Handle errors in fetching the Wikipedia data
    }
  },
  interactionRun: async (interaction) => {
    const userMessage = interaction.options.getString("topic");  // Get the topic from the slash command
    if (!userMessage) {  // If no topic is provided, return an error
      return interaction.reply("Please specify a topic to get information from Wikipedia.");
    }

    try {
      // Fetch information from Wikipedia API (same as in messageRun)
      const { data } = await axios.get(wikipediaAPI, {
        params: {
          action: 'query',
          format: 'json',
          prop: 'extracts',
          exintro: true,
          titles: userMessage,
        },
      });

      const page = data.query.pages[Object.keys(data.query.pages)[0]];

      if (page && page.extract) {  // If page data and extract are available
        const cleanedContent = cleanContent(page.extract);  // Clean the content

        const chunkSize = 7000;
        const chunks = [];
        for (let i = 0; i < cleanedContent.length; i += chunkSize) {
          chunks.push(cleanedContent.substring(i, i + chunkSize));
        }

        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(page.title)
          .setDescription(chunks[0])
          .setFooter({ text: `Information from Wikipedia - ${new Date().toLocaleString()}` });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('back_chunk')
            .setLabel('Back')
            .setStyle('Secondary')
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('next_chunk')
            .setLabel('Next')
            .setStyle('Primary')
            .setDisabled(chunks.length <= 1)
        );

        const sentMessage = await interaction.reply({ embeds: [embed], components: [row] });

        let currentPage = 0;

        const filter = (interaction) => interaction.user.id === interaction.user.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
          if (interaction.customId === 'next_chunk') {
            currentPage++;
          } else if (interaction.customId === 'back_chunk') {
            currentPage--;
          }

          const newEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(page.title)
            .setDescription(chunks[currentPage])
            .setFooter({ text: `Information from Wikipedia - ${new Date().toLocaleString()}` });

          await interaction.update({
            embeds: [newEmbed],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId('back_chunk')
                  .setLabel('Back')
                  .setStyle('Secondary')
                  .setDisabled(currentPage <= 0),
                new ButtonBuilder()
                  .setCustomId('next_chunk')
                  .setLabel('Next')
                  .setStyle('Primary')
                  .setDisabled(currentPage >= chunks.length - 1)
              ),
            ],
          });
        });

        collector.on('end', () => {
          sentMessage.edit({
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId('back_chunk')
                  .setLabel('Back')
                  .setStyle('Secondary')
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId('next_chunk')
                  .setLabel('Next')
                  .setStyle('Primary')
                  .setDisabled(true)
              ),
            ],
          });
        });
      } else {
        interaction.reply('Sorry, I couldn\'t find any information on that topic.');
      }
    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      interaction.reply('There was an error retrieving the information.');
    }
  },
};
