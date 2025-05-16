const {
    EmbedBuilder,
    ApplicationCommandOptionType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Events,
  } = require("discord.js");
  const { EMBED_COLORS } = require("@root/config.js");
  const cooldown = new Map();
  
  module.exports = {
    name: "dm",
    description: "Send a direct message to a user",
    category: "UTILITY",
    botPermissions: ["EmbedLinks"],
    command: {
      enabled: true,
      usage: "<user_id/mention> <message>",
      minArgsCount: 2,
      aliases: ["message"],
    },
    slashCommand: {
      enabled: true,
      options: [
        {
          name: "user",
          description: "User to DM",
          required: true,
          type: ApplicationCommandOptionType.User,
        },
        {
          name: "message",
          description: "Message to send",
          required: true,
          type: ApplicationCommandOptionType.String,
        },
      ],
    },
  
    messageRun: async (message, args) => {
      const author = message.author;
      message.delete().catch(() => {});
      const userId = args[0].replace(/[<@!>]/g, "");
      const targetUser = await message.client.users.fetch(userId).catch(() => null);
      const text = args.slice(1).join(" ");
  
      if (!targetUser) return message.channel.send("❌ Could not find the user.");
      if (!text) return message.channel.send("❌ Please provide a message to send.");
  
      // Cooldown Check
      if (cooldown.has(author.id)) {
        const timeLeft = cooldown.get(author.id) - Date.now();
        if (timeLeft > 0) {
          const remaining = (timeLeft / 1000).toFixed(1);
          return message.channel.send({
            embeds: [new EmbedBuilder().setColor("Red").setDescription(`⏳ Cooldown: **${remaining}s**`)],
          });
        }
      }
  
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle("📩 You have a new message!")
          .setDescription(`${text}\n\n*To reply, click the button below or type in* <#1343724488306589766>.`)
          .setFooter({ text: `Sent by ${author.tag}`, iconURL: author.displayAvatarURL() });
  
        const replyButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`reply_${author.id}`)
            .setLabel("Reply")
            .setStyle(ButtonStyle.Primary)
        );
  
        await targetUser.send({ embeds: [dmEmbed], components: [replyButton] });
  
        const confirmEmbed = new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle("✅ DM Sent Successfully")
          .addFields(
            { name: "Recipient", value: `<@${targetUser.id}>`, inline: true },
            { name: "Message", value: text }
          )
          .setFooter({ text: `Sent by ${author.tag}`, iconURL: author.displayAvatarURL() });
  
        const replyMsg = await message.channel.send({ embeds: [confirmEmbed] });
        setTimeout(() => replyMsg.delete().catch(() => {}), 5000);
  
        cooldown.set(author.id, Date.now() + 30000);
        setTimeout(() => cooldown.delete(author.id), 30000);
      } catch (err) {
        message.channel.send("❌ Failed to send the DM. The user might have DMs disabled.");
      }
    },
  
    interactionRun: async (interaction) => {
      const targetUser = interaction.options.getUser("user");
      const text = interaction.options.getString("message");
  
      if (cooldown.has(interaction.user.id)) {
        const timeLeft = cooldown.get(interaction.user.id) - Date.now();
        if (timeLeft > 0) {
          const remaining = (timeLeft / 1000).toFixed(1);
          return interaction.followUp({
            embeds: [new EmbedBuilder().setColor("Red").setDescription(`⏳ Cooldown: **${remaining}s**`)],
          });
        }
      }
  
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle("📩 You have a new message!")
          .setDescription(`${text}\n\n*To reply, click the button below or type in* <#1343724488306589766>.`)
          .setFooter({ text: `Sent by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
  
        const replyButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`reply_${interaction.user.id}`)
            .setLabel("Reply")
            .setStyle(ButtonStyle.Primary)
        );
  
        await targetUser.send({ embeds: [dmEmbed], components: [replyButton] });
  
        const confirmEmbed = new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle("✅ DM Sent Successfully")
          .addFields(
            { name: "Recipient", value: `<@${targetUser.id}>`, inline: true },
            { name: "Message", value: text }
          )
          .setFooter({ text: `Sent by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
  
        await interaction.followUp({ embeds: [confirmEmbed] });
        setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
  
        cooldown.set(interaction.user.id, Date.now() + 30000);
        setTimeout(() => cooldown.delete(interaction.user.id), 30000);
      } catch (err) {
        interaction.followUp("❌ Failed to send the DM. The user might have DMs disabled.");
      }
    },
  
    /**
     * 📩 Button Collector & Modal Handling
     */
    setupInteraction: (client) => {
      client.on(Events.InteractionCreate, async (interaction) => {
        // ✅ Handle the "Reply" button click
        if (interaction.isButton() && interaction.customId.startsWith("reply_")) {
          const targetId = interaction.customId.split("_")[1];
          const modal = new ModalBuilder()
            .setCustomId(`reply_modal_${targetId}`)
            .setTitle("Reply to the DM")
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId("reply_content")
                  .setLabel("Your Reply")
                  .setStyle(TextInputStyle.Paragraph)
                  .setRequired(true)
              )
            );
  
          return interaction.showModal(modal);
        }
  
        // ✅ Handle the modal submission
        if (interaction.isModalSubmit() && interaction.customId.startsWith("reply_modal_")) {
          const targetId = interaction.customId.split("_")[2];
          const replyContent = interaction.fields.getTextInputValue("reply_content");
          const targetUser = await interaction.client.users.fetch(targetId).catch(() => null);
  
          if (!targetUser) {
            return interaction.reply({ content: "❌ Could not send the reply. User not found.", ephemeral: true });
          }
  
          const replyEmbed = new EmbedBuilder()
            .setColor(EMBED_COLORS.BOT_EMBED)
            .setTitle("📨 You received a reply!")
            .setDescription(`${replyContent}\n\n*You can continue this conversation in* <#1343724488306589766>.`)
            .setFooter({ text: `Reply from ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
  
          await targetUser.send({ embeds: [replyEmbed] });
  
          await interaction.reply({ content: "✅ Reply sent successfully!", ephemeral: true });
        }
      });
    },
  };
  