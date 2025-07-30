module.exports = {
  automodHandler: require("./automod"),
  commandHandler: require("./command"),
  contextHandler: require("./context"),
  counterHandler: require("./counter"),
  greetingHandler: require("./greeting"),
  inviteHandler: require("./invite"),
  presenceHandler: require("./presence"),
  reactionRoleHandler: require("./reactionRoles"),
  statsHandler: require("./stats"),
  suggestionHandler: require("./suggestion"),
  ticketHandler: require("../commands/ticket/ticket.js"),
  translationHandler: require("./translation"),
};
