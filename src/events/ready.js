const { counterHandler, inviteHandler, presenceHandler } = require("@src/handlers");
const { cacheReactionRoles } = require("@schemas/ReactionRoles");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 */
module.exports = async (client) => {
  client.logger.success(`Logged in as ${client.user.tag}! (${client.user.id})`);

  // Update Bot Presence
  if (client.config?.PRESENCE?.ENABLED) {
    presenceHandler(client);
  }

  // Register Interactions
  const interactions = client.config?.INTERACTIONS;
  if (interactions?.SLASH || interactions?.CONTEXT) {
    if (interactions.GLOBAL) {
      await client.registerInteractions();
    } else {
      await client.registerInteractions(interactions.TEST_GUILD_ID);
    }
  }

  // Load reaction roles to cache
  await cacheReactionRoles(client);

  // Initialize features per guild
  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild);

    // initialize counter
    if (settings?.counters?.length > 0) {
      await counterHandler.init(guild, settings);
    }

    // cache invites
    if (settings?.invite?.tracking) {
      inviteHandler.cacheGuildInvites(guild);
    }
  }

  // Auto-update counter channels every 10 mins
  setInterval(() => counterHandler.updateCounterChannels(client), 10 * 60 * 1000);
};
