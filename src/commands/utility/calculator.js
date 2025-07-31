const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "calculator",
  description: "Perform basic arithmetic operations",
  category: "UTILITY",
  aliases: ["calcul", "calculate"], // ✅ Aliases added
  botPermissions: ["EmbedLinks"],

  command: {
    enabled: true,
    usage: "<num1> <operator> <num2>",
    minArgsCount: 3,
  },

  slashCommand: {
    enabled: true,
    options: [
      {
        name: "num1",
        description: "First number",
        required: true,
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: "operator",
        description: "Operator (+, -, ×, ÷)",
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: [
          { name: "+ (Addition)", value: "+" },
          { name: "- (Subtraction)", value: "-" },
          { name: "× (Multiplication)", value: "*" },
          { name: "÷ (Division)", value: "/" },
        ],
      },
      {
        name: "num2",
        description: "Second number",
        required: true,
        type: ApplicationCommandOptionType.Number,
      },
    ],
  },

  /**
   * Message Command
   */
  messageRun: async (message, args) => {
    const [num1, operator, num2] = [parseFloat(args[0]), args[1], parseFloat(args[2])];
    if (isNaN(num1) || isNaN(num2)) return message.safeReply("❌ Please provide valid numbers.");

    const result = calculate(num1, operator);
    if (result === null) {
      return message.safeReply("❌ Invalid operator. Use +, -, *, /, x, ×, ÷, add, subtract, multiply, divide");
    }

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("🧮 Calculator Result")
      .setDescription(`\`${num1} ${normalizeOperator(operator)} ${num2} = ${result(num2)}\``);

    message.safeReply({ embeds: [embed] });
  },

  /**
   * Slash Command
   */
  interactionRun: async (interaction) => {
    const num1 = interaction.options.getNumber("num1");
    const operator = interaction.options.getString("operator");
    const num2 = interaction.options.getNumber("num2");

    const result = calculate(num1, operator);
    if (result === null) {
      return interaction.followUp("❌ Invalid operator. Use +, -, ×, ÷");
    }

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("🧮 Calculator Result")
      .setDescription(`\`${num1} ${normalizeOperator(operator)} ${num2} = ${result(num2)}\``);

    interaction.followUp({ embeds: [embed] });
  },
};

/**
 * Normalize operator for display
 */
function normalizeOperator(operator) {
  switch (operator) {
    case "+":
    case "add": return "+";
    case "-":
    case "subtract": return "-";
    case "*":
    case "x":
    case "×":
    case "multiply": return "×";
    case "/":
    case "÷":
    case "divide": return "÷";
    default: return operator;
  }
}

/**
 * Calculate based on normalized operator
 */
function calculate(num1, operator) {
  switch (operator.toLowerCase()) {
    case "+":
    case "add":
      return (num2) => num1 + num2;
    case "-":
    case "subtract":
      return (num2) => num1 - num2;
    case "*":
    case "x":
    case "×":
    case "multiply":
      return (num2) => num1 * num2;
    case "/":
    case "÷":
    case "divide":
      return (num2) => num2 !== 0 ? (num1 / num2) : "Infinity";
    default:
      return null;
  }
}
