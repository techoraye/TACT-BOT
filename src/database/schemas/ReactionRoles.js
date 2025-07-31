const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = new mongoose.Schema(
  {
    guild_id: reqString,
    channel_id: reqString,
    message_id: reqString,
    roles: [
      {
        _id: false,
        emote: reqString,
        role_id: reqString,
      },
    ],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false, // Avoid tracking the 'updatedAt' field, since it's not needed.
    },
  }
);

// Check if model is already compiled to prevent "OverwriteModelError" on reload.
const Model = mongoose.models["reaction-roles"] || mongoose.model("reaction-roles", Schema);

// Cache for reaction roles
const rrCache = new Map();
const getKey = (guildId, channelId, messageId) => `${guildId}|${channelId}|${messageId}`;

module.exports = {
  model: Model,

  // Cache reaction roles from the database and validate them.
  cacheReactionRoles: async (client) => {
    // Clear previous cache
    rrCache.clear();

    // Load all documents from the database
    const docs = await Model.find().lean();

    // Validate and cache documents
    for (const doc of docs) {
      const guild = client.guilds.cache.get(doc.guild_id);
      if (!guild) {
        // No need to remove from database here; handle missing guild gracefully
        continue;
      }
      if (!guild.channels.cache.has(doc.channel_id)) {
        // No need to remove from database here; handle missing channel gracefully
        continue;
      }

      // Cache the roles for this message
      const key = getKey(doc.guild_id, doc.channel_id, doc.message_id);
      rrCache.set(key, doc.roles);
    }
  },

  // Get reaction roles from cache, or return an empty array if not cached
  getReactionRoles: (guildId, channelId, messageId) => rrCache.get(getKey(guildId, channelId, messageId)) || [],

  // Add a reaction role for a given guild, channel, message, emote, and role
  addReactionRole: async (guildId, channelId, messageId, emote, roleId) => {
    const filter = { guild_id: guildId, channel_id: channelId, message_id: messageId };

    // Pull existing roles if this emote already exists
    await Model.updateOne(filter, { $pull: { roles: { emote } } });

    // Add the new emote and role
    const data = await Model.findOneAndUpdate(
      filter,
      {
        $push: {
          roles: { emote, role_id: roleId },
        },
      },
      { upsert: true, new: true }
    ).lean();

    // Update cache with the new roles
    const key = getKey(guildId, channelId, messageId);
    rrCache.set(key, data.roles);
  },

  // Remove reaction role configuration for a specific guild, channel, and message
  removeReactionRole: async (guildId, channelId, messageId) => {
    // Remove from the database
    await Model.deleteOne({
      guild_id: guildId,
      channel_id: channelId,
      message_id: messageId,
    });

    // Remove from cache
    rrCache.delete(getKey(guildId, channelId, messageId));
  },
};
