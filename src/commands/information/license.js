const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "license",
  description: "Display the MIT License for this bot.",
  cooldown: 5,
  isPremium: false,
  category: "INFORMATION",
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: [],
  validations: [],
  command: {
    enabled: true,
    aliases: ["mitlicense", "licenseinfo"],
    usage: "*license",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },

  messageRun: async (message) => {
    const embed = new EmbedBuilder()
      .setTitle("📜 MIT License")
      .setDescription("The MIT License (MIT) \n\nCopyright (c) 2025-present Techarye")
      .setColor("#FF0000")
      .addFields(
        {
          name: "License Permissions",
          value:
            "Permission is hereby granted, free of charge, to any person obtaining a copy of this bot and associated documentation files (the 'Bot'), to deal in the Bot without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Bot, and to permit persons to whom the Bot is furnished to do so, subject to the following conditions:",
        },
        {
          name: "License Conditions",
          value:
            "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Bot.",
        },
        {
          name: "Disclaimer",
          value:
            "THE BOT IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE BOT OR THE USE OR OTHER DEALINGS IN THE BOT.",
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },

  interactionRun: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("📜 MIT License")
      .setDescription("The MIT License (MIT) \n\nCopyright (c) 2025-present Techarye")
      .setColor("#FF0000")
      .addFields(
        {
          name: "License Permissions",
          value:
            "Permission is hereby granted, free of charge, to any person obtaining a copy of this bot and associated documentation files (the 'Bot'), to deal in the Bot without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Bot, and to permit persons to whom the Bot is furnished to do so, subject to the following conditions:",
        },
        {
          name: "License Conditions",
          value:
            "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Bot.",
        },
        {
          name: "Disclaimer",
          value:
            "THE BOT IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE BOT OR THE USE OR OTHER DEALINGS IN THE BOT.",
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  },
};
