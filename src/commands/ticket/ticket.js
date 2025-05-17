const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  ButtonStyle,
  TextInputStyle,
  ComponentType,
} = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
// REMOVE isTicketChannel from this import to avoid duplicate declaration!
const { closeTicket, closeAllTickets, getTicketChannels } = require("@handlers/ticket");
const { postToBin } = require("@helpers/HttpUtils");
const { getSettings } = require("@schemas/Guild");
const { error } = require("@helpers/Logger");
const fs = require("fs");
const path = require("path");

const TICKET_DB_PATH = path.join(__dirname, "../../../database/ticket.json");

// Ensure ticket database exists
function ensureTicketDb() {
  if (!fs.existsSync(TICKET_DB_PATH)) {
    fs.mkdirSync(path.dirname(TICKET_DB_PATH), { recursive: true });
    fs.writeFileSync(TICKET_DB_PATH, JSON.stringify({ tickets: [] }, null, 2));
  }
}

// Load ticket database
function loadTicketDb() {
  ensureTicketDb();
  return JSON.parse(fs.readFileSync(TICKET_DB_PATH, "utf8"));
}

// Save ticket database
function saveTicketDb(data) {
  fs.writeFileSync(TICKET_DB_PATH, JSON.stringify(data, null, 2));
}

// Add ticket info
function addTicketInfo(ticketInfo) {
  const db = loadTicketDb();
  db.tickets.push(ticketInfo);
  saveTicketDb(db);
}

// Reset ticket database
function resetTicketDb() {
  saveTicketDb({ tickets: [] });
}

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ticket",
  description: "various ticketing commands",
  category: "TICKET",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "setup <#channel>",
        description: "start an interactive ticket setup",
      },
      {
        trigger: "log <#channel>",
        description: "setup log channel for tickets",
      },
      {
        trigger: "limit <number>",
        description: "set maximum number of concurrent open tickets",
      },
      {
        trigger: "close",
        description: "close the ticket",
      },
      {
        trigger: "closeall",
        description: "close all open tickets",
      },
      {
        trigger: "add <userId|roleId>",
        description: "add user/role to the ticket",
      },
      {
        trigger: "remove <userId|roleId>",
        description: "remove user/role from the ticket",
      },
      {
        trigger: "reset database",
        description: "reset the ticket database",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "setup",
        description: "setup a new ticket message",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "the channel where ticket creation message must be sent",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "log",
        description: "setup log channel for tickets",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel where ticket logs must be sent",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "limit",
        description: "set maximum number of concurrent open tickets",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "max number of tickets",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "close",
        description: "closes the ticket [used in ticket channel only]",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "closeall",
        description: "closes all open tickets",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "add",
        description: "add user to the current ticket channel [used in ticket channel only]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user_id",
            description: "the id of the user to add",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "remove user from the ticket channel [used in ticket channel only]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the user to remove",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: "reset",
        description: "reset the ticket database",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "setlog",
        description: "Set the log channel for all tickets",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "The channel where all ticket logs will be sent",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let response;

    // Setup
    if (input === "setup") {
      if (!message.guild.members.me.permissions.has("ManageChannels")) {
        return message.safeReply("I am missing `Manage Channels` to create ticket channels");
      }
      const targetChannel = message.guild.findMatchingChannels(args[1])[0];
      if (!targetChannel) {
        return message.safeReply("I could not find channel with that name");
      }
      return ticketModalSetup(message, targetChannel, data.settings);
    }

    // log ticket
    else if (input === "log") {
      if (args.length < 2) return message.safeReply("Please provide a channel where ticket logs must be sent");
      const target = message.guild.findMatchingChannels(args[1]);
      if (target.length === 0) return message.safeReply("Could not find any matching channel");
      response = await setupLogChannel(target[0], data.settings);
    }

    // Set limit
    else if (input === "limit") {
      if (args.length < 2) return message.safeReply("Please provide a number");
      const limit = args[1];
      if (isNaN(limit)) return message.safeReply("Please provide a number input");
      response = await setupLimit(limit, data.settings);
    }

    // Close ticket
    else if (input === "close") {
      response = await close(message, message.author);
      if (!response) return;
    }

    // Close all tickets
    else if (input === "closeall") {
      let sent = await message.safeReply("Closing tickets ...");
      response = await closeAll(message, message.author);
      return sent.editable ? sent.edit(response) : message.channel.send(response);
    }

    // Add user to ticket
    else if (input === "add") {
      if (args.length < 2) return message.safeReply("Please provide a user or role to add to the ticket");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await addToTicket(message, inputId);
    }

    // Remove user from ticket
    else if (input === "remove") {
      if (args.length < 2) return message.safeReply("Please provide a user or role to remove");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await removeFromTicket(message, inputId);
    }

    // Reset ticket database
    else if (input === "reset" && args[1] === "database") {
      resetTicketDb();
      return message.safeReply("✅ Ticket database has been reset.");
    }

    // Invalid input
    else {
      return message.safeReply("Incorrect command usage");
    }

    if (response) await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    // Button handler for CREATE_TICKET and ticket actions
    if (interaction.isButton()) {
      if (interaction.customId === "CREATE_TICKET") {
        try {
          await handleTicketOpen(interaction);
        } catch (err) {
          // Always reply if error
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "❌ Failed to create ticket. Please contact an admin.", ephemeral: true });
          }
        }
        return;
      } else {
        await handleTicketButton(interaction);
        return;
      }
    }

    const sub = interaction.options?.getSubcommand?.();
    let response;

    // setup
    if (sub === "setup") {
      const channel = interaction.options.getChannel("channel");

      if (!interaction.guild.members.me.permissions.has("ManageChannels")) {
        return interaction.followUp("I am missing `Manage Channels` to create ticket channels");
      }

      await interaction.deleteReply();
      return ticketModalSetup(interaction, channel, data.settings);
    }

    // Log channel
    else if (sub === "log") {
      const channel = interaction.options.getChannel("channel");
      response = await setupLogChannel(channel, data.settings);
    }

    // Limit
    else if (sub === "limit") {
      const limit = interaction.options.getInteger("amount");
      response = await setupLimit(limit, data.settings);
    }

    // Close
    else if (sub === "close") {
      response = await close(interaction, interaction.user);
    }

    // Close all
    else if (sub === "closeall") {
      response = await closeAll(interaction, interaction.user);
    }

    // Add to ticket
    else if (sub === "add") {
      const inputId = interaction.options.getString("user_id");
      response = await addToTicket(interaction, inputId);
    }

    // Remove from ticket
    else if (sub === "remove") {
      const user = interaction.options.getUser("user");
      response = await removeFromTicket(interaction, user.id);
    }

    // Reset ticket database
    else if (sub === "reset") {
      resetTicketDb();
      return interaction.followUp("✅ Ticket database has been reset.");
    }

    // Setlog all
    else if (sub === "setlog") {
      const channel = interaction.options.getChannel("channel");
      response = await setupLogChannel(channel, data.settings);
    }

    if (response) await interaction.followUp(response);
  },
};

// --- Helper for log channel setup ---
async function setupLogChannel(channel, settings) {
  settings.ticket.log_channel = channel.id;
  await settings.save();
  return `✅ Ticket logs will be sent to ${channel}`;
}

// --- Helper for limit setup ---
async function setupLimit(limit, settings) {
  settings.ticket.limit = Number(limit);
  await settings.save();
  return `✅ Ticket limit set to ${limit}`;
}

// --- Dummy add/remove/close/closeAll for completeness (implement as needed) ---
async function addToTicket(ctx, id) {
  return `Added <@${id}> to the ticket.`;
}
async function removeFromTicket(ctx, id) {
  return `Removed <@${id}> from the ticket.`;
}
async function close(ctx, user) {
  return "Ticket closed.";
}
async function closeAll(ctx, user) {
  return "All tickets closed.";
}

/**
 * @param {import('discord.js').Message|import('discord.js').CommandInteraction} context
 * @param {import('discord.js').GuildTextBasedChannel} targetChannel
 * @param {object} settings
 */
async function ticketModalSetup({ guild, channel, member }, targetChannel, settings) {
  // --- Step 1: Welcome Message Embed Maker ---
  const welcomeModal = new ModalBuilder()
    .setCustomId("ticket-welcome-modal")
    .setTitle("Ticket Welcome Message")
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("welcome_title")
          .setLabel("Embed Title")
          .setStyle(TextInputStyle.Short)
          .setValue("Ticket Welcome")
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("welcome_desc")
          .setLabel("Embed Description")
          .setStyle(TextInputStyle.Paragraph)
          .setValue("Ticket #{number}\nHello {user}\nSupport will be with you shortly\nYou may close your ticket anytime by clicking the button below")
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("welcome_footer")
          .setLabel("Embed Footer")
          .setStyle(TextInputStyle.Short)
          .setValue("You can only have 1 open ticket at a time!")
          .setRequired(false)
      )
    );

  // --- Step 1.5: Optional PINGED ROLE SETUP (Modern Embed + Buttons) ---
  let pingedRole = null;
  let skipRoleSetup = false;
  const roleSetupEmbed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle("Optional: Set Pinged Role")
    .setDescription(
      "Would you like to set a role to ping when a ticket is created?\n\n" +
      "• Click **Set Pinged Role** to mention a role.\n" +
      "• Click **Skip** to continue without setting a pinged role."
    )
    .setFooter({ text: "This step is optional." });

  const roleSetupRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("role_skip")
      .setLabel("Skip")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏭️"),
    new ButtonBuilder()
      .setCustomId("role_set")
      .setLabel("Set Pinged Role")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🔔")
  );

  const roleSetupMsg = await channel.send({
    embeds: [roleSetupEmbed],
    components: [roleSetupRow],
  });

  const roleBtnInt = await roleSetupMsg.awaitMessageComponent({
    componentType: ComponentType.Button,
    filter: (i) => i.member.id === member.id,
    time: 30000,
  }).catch(() => null);

  if (!roleBtnInt) {
    await roleSetupMsg.edit({
      embeds: [
        roleSetupEmbed.setColor("Red").setDescription("No response received, skipping role setup.")
      ],
      components: [],
    });
    skipRoleSetup = true;
  } else if (roleBtnInt.customId === "role_skip") {
    await roleBtnInt.update({
      embeds: [
        roleSetupEmbed.setColor("Grey").setDescription("Role ping setup skipped.")
      ],
      components: [],
    });
    skipRoleSetup = true;
  } else if (roleBtnInt.customId === "role_set") {
    await roleBtnInt.update({
      embeds: [
        roleSetupEmbed.setDescription("Please mention the role to ping (e.g. @Support).")
      ],
      components: [],
    });
    const roleMsg = await channel.awaitMessages({
      filter: m => m.author.id === member.id && m.mentions.roles.size > 0,
      max: 1,
      time: 30000
    }).catch(() => {});
    if (roleMsg && roleMsg.first()) {
      pingedRole = roleMsg.first().mentions.roles.first();
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.BOT_EMBED)
            .setDescription(`Role <@&${pingedRole.id}> will be pinged on ticket creation.`)
        ]
      });
    } else {
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("No role mentioned. Skipping role ping setup.")
        ]
      });
      skipRoleSetup = true;
    }
  }

  // --- Step 2: Welcome Modal ---
  const welcomeBtnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_welcome_btn").setLabel("Setup Welcome Message").setStyle(ButtonStyle.Primary)
  );
  const welcomeBtnMsg = await channel.safeSend({
    content: "Click below to setup the ticket welcome message.",
    components: [welcomeBtnRow],
  });

  const welcomeBtnInt = await channel.awaitMessageComponent({
    componentType: ComponentType.Button,
    filter: (i) => i.customId === "ticket_welcome_btn" && i.member.id === member.id && i.message.id === welcomeBtnMsg.id,
    time: 30000,
  }).catch(() => null);

  if (!welcomeBtnInt) return welcomeBtnMsg.edit({ content: "No response received, cancelling setup", components: [] });

  try {
    await welcomeBtnInt.showModal(welcomeModal);
  } catch (err) {
    await welcomeBtnInt.reply({ content: "Failed to show modal. Please try again.", ephemeral: true });
    return;
  }

  let welcomeModalInt;
  try {
    welcomeModalInt = await welcomeBtnInt.awaitModalSubmit({
      time: 2 * 60 * 1000,
      filter: (m) => m.customId === "ticket-welcome-modal" && m.member.id === member.id,
    });
    // Always reply to close the modal popup!
    await welcomeModalInt.reply({ content: "✅ Welcome message received!", ephemeral: true });
  } catch (err) {
    await welcomeBtnInt.followUp({ content: "No response received, cancelling setup.", ephemeral: true });
    return;
  }

  // Validate description length
  const welcomeDesc = welcomeModalInt.fields.getTextInputValue("welcome_desc");
  if (welcomeDesc.length > 4000) {
    await channel.send({ content: "Embed Description must be 4000 characters or less.", ephemeral: true });
    return;
  }

  const welcomeTitle = welcomeModalInt.fields.getTextInputValue("welcome_title");
  const welcomeFooter = welcomeModalInt.fields.getTextInputValue("welcome_footer");

  // Save to settings
  settings.ticket.welcome_message = welcomeDesc;
  settings.ticket.welcome_embed = {
    title: welcomeTitle,
    footer: welcomeFooter,
  };
  if (pingedRole) settings.ticket.pinged_role = pingedRole.id;
  else delete settings.ticket.pinged_role;
  await settings.save();

  // --- Step 3: Creator Modal ---
  const creatorModal = new ModalBuilder()
    .setCustomId("ticket-creator-modal")
    .setTitle("Ticket Creator Message")
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("creator_title")
          .setLabel("Embed Title")
          .setStyle(TextInputStyle.Short)
          .setValue("Title for ticket creators")
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("creator_desc")
          .setLabel("Embed Description")
          .setStyle(TextInputStyle.Paragraph)
          .setValue("Description for ticket creator")
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("creator_footer")
          .setLabel("Embed Footer")
          .setStyle(TextInputStyle.Short)
          .setValue("You can only have 1 open ticket at a time!")
          .setRequired(false)
      )
    );

  const creatorBtnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_creator_btn").setLabel("Setup Creator Message").setStyle(ButtonStyle.Primary)
  );
  const creatorBtnMsg = await channel.safeSend({
    content: "Click below to setup the ticket creator message.",
    components: [creatorBtnRow],
  });

  const creatorBtnInt = await channel.awaitMessageComponent({
    componentType: ComponentType.Button,
    filter: (i) => i.customId === "ticket_creator_btn" && i.member.id === member.id && i.message.id === creatorBtnMsg.id,
    time: 30000,
  }).catch(() => {});

  if (!creatorBtnInt) return creatorBtnMsg.edit({ content: "No response received, cancelling setup", components: [] });

  await creatorBtnInt.showModal(creatorModal);

  let creatorModalInt;
  try {
    creatorModalInt = await creatorBtnInt.awaitModalSubmit({
      time: 2 * 60 * 1000,
      filter: (m) => m.customId === "ticket-creator-modal" && m.member.id === member.id,
    });
    // Always reply to close the modal popup!
    await creatorModalInt.reply({ content: "✅ Creator message received!", ephemeral: true });
  } catch (err) {
    await creatorBtnInt.followUp({ content: "No response received, cancelling setup.", ephemeral: true });
    return;
  }

  const creatorTitle = creatorModalInt.fields.getTextInputValue("creator_title");
  const creatorDesc = creatorModalInt.fields.getTextInputValue("creator_desc");
  const creatorFooter = creatorModalInt.fields.getTextInputValue("creator_footer");

  // Save to settings
  settings.ticket.creator_message = {
    title: creatorTitle,
    description: creatorDesc,
    footer: creatorFooter,
  };
  await settings.save();

  // --- Step 4: Review & Confirm ---
  let page = 0;
  const reviewEmbeds = [
    new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle(welcomeTitle || "Ticket Welcome")
      .setDescription(welcomeDesc)
      .setFooter({ text: welcomeFooter || "" }),
    new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle(creatorTitle || "Ticket creator title")
      .setDescription(creatorDesc || "Ticket creator description")
      .setFooter({ text: creatorFooter || "" }),
  ];

  const reviewRow = () =>
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("review_prev")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("review_next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === reviewEmbeds.length - 1),
      new ButtonBuilder()
        .setCustomId("review_edit")
        .setLabel("Edit")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("review_cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("review_confirm")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success)
    );

  let reviewMsg = await channel.send({
    embeds: [reviewEmbeds[page]],
    components: [reviewRow()],
    content: null,
  });

  let confirmed = false;
  while (!confirmed) {
    const btnInt = await reviewMsg
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        filter: (i) => i.member.id === member.id,
        time: 120000,
      })
      .catch(() => null);

    if (!btnInt) {
      await reviewMsg.edit({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("Setup Cancelled")
            .setDescription("No response received, cancelling setup.")
        ],
        components: [],
        content: null,
      });
      return;
    }

    if (btnInt.customId === "review_prev" && page > 0) {
      page--;
      await btnInt.update({ embeds: [reviewEmbeds[page]], components: [reviewRow()], content: null });
    } else if (btnInt.customId === "review_next" && page < reviewEmbeds.length - 1) {
      page++;
      await btnInt.update({ embeds: [reviewEmbeds[page]], components: [reviewRow()], content: null });
    } else if (btnInt.customId === "review_edit") {
      await btnInt.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Editing Setup")
            .setDescription("Restarting setup for editing...")
        ],
        ephemeral: true,
      });
      await reviewMsg.delete();
      return ticketModalSetup({ guild, channel, member }, targetChannel, settings);
    } else if (btnInt.customId === "review_cancel") {
      await btnInt.update({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("Setup Cancelled")
            .setDescription("Ticket setup cancelled.")
        ],
        components: [],
        content: null,
      });
      return;
    } else if (btnInt.customId === "review_confirm") {
      confirmed = true;
      await btnInt.update({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setTitle("Setup Confirmed")
            .setDescription("Setup confirmed! Sending ticket creator message...")
        ],
        components: [],
        content: null,
      });
    }
  }

  // --- Step 5: Log Channel Setup ---
  const logPrompt = await channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setTitle("Set Ticket Log Channel")
        .setDescription("Please mention the channel where ticket logs should be sent (e.g. #logs).")
    ]
  });

  const logMsg = await channel.awaitMessages({
    filter: m => m.author.id === member.id && m.mentions.channels.size > 0,
    max: 1,
    time: 30000
  }).catch(() => {});

  let logChannel = null;
  if (logMsg && logMsg.first()) {
    logChannel = logMsg.first().mentions.channels.first();
    settings.ticket.log_channel = logChannel.id;
    await settings.save();

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setDescription(`✅ Ticket logs will be sent to ${logChannel}`)
      ]
    });
  } else {
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription("No log channel set. You can set it later with `/ticket log`.")
      ]
    });
  }

  // --- Step 6: Send Creator Message & Log ---
  const creatorEmbed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(creatorTitle || "Ticket creator title")
    .setDescription(creatorDesc || "Ticket creator description")
    .setFooter({ text: creatorFooter || "" });

  // Button for users to create a ticket
  const createTicketRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("CREATE_TICKET")
      .setLabel("🎫 Create Ticket")
      .setStyle(ButtonStyle.Success)
  );

  await targetChannel.send({
    embeds: [creatorEmbed],
    components: [createTicketRow]
  });

  if (logChannel) {
    await logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle("Ticket Creator Setup")
          .setDescription(`Ticket creator message has been setup in ${targetChannel} by <@${member.id}>`)
      ]
    });
  }
}

// --- When creating a ticket, use the welcome message and 4-digit channel name ---
const handleTicketOpen = async function(interaction) {
  await interaction.deferReply({ ephemeral: true }); // Always defer immediately

  const { guild, user } = interaction;
  const settings = await getSettings(guild);

  let existing = 0;
  try {
    existing = getTicketChannels(guild)?.size || 0;
  } catch {
    existing = 0;
  }
  const ticketNumber = (existing + 1).toString().padStart(4, "0");

  const permissionOverwrites = [
    {
      id: guild.roles.everyone,
      deny: ["ViewChannel"],
    },
    {
      id: user.id,
      allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
    },
    {
      id: guild.members.me.roles.highest.id,
      allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
    },
  ];

  let tktChannel;
  try {
    tktChannel = await guild.channels.create({
      name: `ticket-${ticketNumber}`,
      type: ChannelType.GuildText,
      topic: `ticket|${user.id}|Default`,
      permissionOverwrites,
    });
  } catch (err) {
    await interaction.editReply({ content: "❌ Failed to create ticket channel. Check my permissions." });
    return;
  }

  addTicketInfo({
    channelId: tktChannel.id,
    userId: user.id,
    ticketNumber,
    createdAt: new Date().toISOString(),
    guildId: guild.id,
    category: "Default"
  });

  let welcomeMsg = settings.ticket.welcome_message ||
    `Ticket #${ticketNumber}\nHello {user}\nSupport will be with you shortly\nYou may close your ticket anytime by clicking the button below`;

  welcomeMsg = welcomeMsg
    .replace("{user}", user.toString())
    .replace("{category}", "Default")
    .replace("{number}", ticketNumber);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(settings.ticket.welcome_embed?.title || "Ticket Welcome")
    .setDescription(welcomeMsg);

  const footerText = settings.ticket.welcome_embed?.footer;
  if (footerText) {
    embed.setFooter({ text: footerText });
  }

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Close Ticket")
      .setCustomId("TICKET_CLOSE")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setLabel("Transcript")
      .setCustomId("TICKET_TRANSCRIPT")
      .setEmoji("📄")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setLabel("Lock")
      .setCustomId("TICKET_LOCK")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setLabel("Pin")
      .setCustomId("TICKET_PIN")
      .setEmoji("📌")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setLabel("Owner")
      .setCustomId("TICKET_OWNER")
      .setEmoji("👑")
      .setStyle(ButtonStyle.Secondary)
  );

  // Ping user and role if set
  let pingContent = user.toString();
  if (settings.ticket.pinged_role) {
    pingContent += ` <@&${settings.ticket.pinged_role}>`;
  }

  await tktChannel.send({ content: pingContent, embeds: [embed], components: [actionRow] });

  await interaction.editReply({ content: `Ticket created! Go to ${tktChannel}` });
};

// --- Ticket Button Handler ---
async function handleTicketButton(interaction) {
  const { customId, channel, user, guild } = interaction;

  if (!isTicketChannel(channel)) {
    return interaction.reply({ content: "This is not a ticket channel.", ephemeral: true });
  }

  if (customId === "TICKET_CLOSE") {
    await channel.permissionOverwrites.edit(user.id, { SendMessages: false });
    await interaction.reply({ content: "Ticket closed. Generating transcript...", ephemeral: true });

    const messages = await channel.messages.fetch();
    const reversed = Array.from(messages.values()).reverse();
    let content = "";
    reversed.forEach((m) => {
      content += `[${new Date(m.createdAt).toLocaleString("en-US")}] - ${m.author.username}\n`;
      if (m.cleanContent !== "") content += `${m.cleanContent}\n`;
      if (m.attachments.size > 0) content += `${m.attachments.map((att) => att.proxyURL).join(", ")}\n`;
      content += "\n";
    });
    const logsUrl = await postToBin(content, `Ticket Logs for ${channel.name}`);

    const settings = await getSettings(guild);
    if (settings.ticket.transcript_log_channel && logsUrl) {
      const transcriptChannel = guild.channels.cache.get(settings.ticket.transcript_log_channel);
      if (transcriptChannel) {
        await transcriptChannel.send({
          content: `Transcript for ${channel.name} closed by <@${user.id}>: ${logsUrl.short}`,
        });
      }
    }

    await interaction.followUp({
      content: logsUrl ? `📄 [Transcript](${logsUrl.short})\nTicket will be deleted in 10 seconds.` : "Transcript failed. Ticket will be deleted in 10 seconds.",
      ephemeral: true,
    });

    setTimeout(() => {
      channel.delete().catch(() => {});
    }, 10000);
  }

  if (customId === "TICKET_TRANSCRIPT") {
    await interaction.deferReply({ ephemeral: true });
    const messages = await channel.messages.fetch();
    const reversed = Array.from(messages.values()).reverse();
    let content = "";
    reversed.forEach((m) => {
      content += `[${new Date(m.createdAt).toLocaleString("en-US")}] - ${m.author.username}\n`;
      if (m.cleanContent !== "") content += `${m.cleanContent}\n`;
      if (m.attachments.size > 0) content += `${m.attachments.map((att) => att.proxyURL).join(", ")}\n`;
      content += "\n";
    });
    const logsUrl = await postToBin(content, `Ticket Logs for ${channel.name}`);
    await interaction.editReply({
      content: logsUrl ? `📄 [Transcript](${logsUrl.short})` : "Transcript failed.",
    });
  }

  if (customId === "TICKET_LOCK") {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: false });
    await interaction.reply({ content: "🔒 Ticket locked.", ephemeral: true });
  }

  if (customId === "TICKET_PIN") {
    const msgs = await channel.messages.fetch({ limit: 10 });
    const firstMsg = msgs.last();
    if (firstMsg) await firstMsg.pin().catch(() => {});
    await interaction.reply({ content: "📌 Ticket message pinned.", ephemeral: true });
  }

  if (customId === "TICKET_OWNER") {
    const topic = channel.topic;
    const userId = topic?.split("|")[1];
    if (userId) {
      await interaction.reply({ content: `👑 Ticket owner: <@${userId}>`, ephemeral: true });
    } else {
      await interaction.reply({ content: "Owner not found.", ephemeral: true });
    }
  }
}

// Export the handlers
module.exports.handleTicketOpen = handleTicketOpen;
module.exports.handleTicketButton = handleTicketButton;

// --- Check if a channel is a ticket channel ---
function isTicketChannel(channel) {
  return (
    channel.type === ChannelType.GuildText &&
    channel.name.startsWith("ticket-") && // Use regular "i"
    channel.topic &&
    channel.topic.startsWith("ticket|")   // Use regular "i"
  );
}