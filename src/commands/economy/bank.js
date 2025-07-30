const { ApplicationCommandOptionType } = require("discord.js");
const balance = require("./sub/balance");
const deposit = require("./sub/deposit");
const transfer = require("./sub/transfer");
const withdraw = require("./sub/withdraw");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bank",
  description: "access to bank operations",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],

  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "balance",
        description: "check your balance",
      },
      {
        trigger: "deposit <coins>",
        description: "deposit coins to your bank account",
      },
      {
        trigger: "withdraw <coins>",
        description: "withdraw coins from your bank account",
      },
      {
        trigger: "transfer <user> <coins>",
        description: "transfer coins to another user",
      },
    ],
  },

  slashCommand: {
    enabled: true,
    options: [
      {
        name: "balance",
        description: "check your coin balance",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "name of the user",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "deposit",
        description: "deposit coins to your bank account",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "coins",
            description: "number of coins to deposit",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "withdraw",
        description: "withdraw coins from your bank account",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "coins",
            description: "number of coins to withdraw",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "transfer",
        description: "transfer coins to other user",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the user to whom coins must be transferred",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "coins",
            description: "the amount of coins to transfer",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    const serverId = message.guild.id;
    let response;

    switch (sub) {
      case "balance": {
        const target = await message.guild.resolveMember(args[1]) || message.member;
        response = await balance(target.user, serverId);
        break;
      }

      case "deposit": {
        const coins = parseInt(args[1]);
        if (isNaN(coins) || coins <= 0) return message.safeReply("Please enter a valid number of coins to deposit.");
        response = await deposit(message.author, coins, serverId);
        break;
      }

      case "withdraw": {
        const coins = parseInt(args[1]);
        if (isNaN(coins) || coins <= 0) return message.safeReply("Please enter a valid number of coins to withdraw.");
        response = await withdraw(message.author, coins, serverId);
        break;
      }

      case "transfer": {
        if (args.length < 3) return message.safeReply("Usage: `transfer <user> <coins>`");

        const target = await message.guild.resolveMember(args[1]);
        if (!target) return message.safeReply("That user doesn't exist.");

        const coins = parseInt(args[2]);
        if (isNaN(coins) || coins <= 0) return message.safeReply("Please enter a valid number of coins to transfer.");

        response = await transfer(message.author, target.user, coins, serverId);
        break;
      }

      default:
        return message.safeReply("Invalid subcommand. Use `balance`, `deposit`, `withdraw`, or `transfer`.");
    }

    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    const serverId = interaction.guild.id;
    let response;

    switch (sub) {
      case "balance": {
        const user = interaction.options.getUser("user") || interaction.user;
        if (!user) return interaction.followUp("Unable to fetch user.");
        response = await balance(user, serverId);
        break;
      }

      case "deposit": {
        const coins = interaction.options.getInteger("coins");
        if (!coins || coins <= 0) return interaction.followUp("Please enter a valid number of coins to deposit.");
        response = await deposit(interaction.user, coins, serverId);
        break;
      }

      case "withdraw": {
        const coins = interaction.options.getInteger("coins");
        if (!coins || coins <= 0) return interaction.followUp("Please enter a valid number of coins to withdraw.");
        response = await withdraw(interaction.user, coins, serverId);
        break;
      }

      case "transfer": {
        const target = interaction.options.getUser("user");
        const coins = interaction.options.getInteger("coins");

        if (!target) return interaction.followUp("Invalid user provided.");
        if (!coins || coins <= 0) return interaction.followUp("Please enter a valid number of coins to transfer.");

        response = await transfer(interaction.user, target, coins, serverId);
        break;
      }

      default:
        return interaction.followUp("Invalid subcommand.");
    }

    return interaction.followUp(response);
  },
};
