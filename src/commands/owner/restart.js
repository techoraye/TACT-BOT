const { EmbedBuilder } = require("discord.js");
const { OWNER_IDS } = require("../../../config.js"); // Adjust path as needed
const path = require("path");

module.exports = {
    name: "restart",
    description: "Restarts the bot internally (Owner only)",
    category: "OWNER",
    botPermissions: ["SendMessages", "EmbedLinks"],
    command: {
        enabled: true,
        aliases: ["reboot", "reload"],
        usage: "",
        cooldown: 300, // 5-minute cooldown to prevent accidental restarts
    },
    slashCommand: {
        enabled: false, // Disabled for now, enable if you plan to implement slash commands
    },

    async messageRun(message) {
        // Check if the author is the bot owner
        if (!OWNER_IDS.includes(message.author.id)) {
            return message.reply("❌ You are not authorized to use this command.");
        }

        // Access the client instance via message.client
        const client = message.client;

        // Create an embed to inform the user
        const embed = new EmbedBuilder()
            .setColor(client.config?.EMBED_COLORS?.BOT_EMBED || '#0099ff') // Fallback color
            .setTitle("Bot Internal Restart")
            .setDescription("The bot is restarting internally... Please wait a moment.")
            .setFooter({ text: `Requested by ${message.author.tag}` });

        // Send the embed to the channel
        await message.reply({ embeds: [embed] });

        console.log(`[INTERNAL RESTART] Restart command triggered by ${message.author.tag} (${message.author.id}).`);

        try {
            // 1. Gracefully destroy the current client connection
            console.log('[INTERNAL RESTART] Destroying Discord client...');
            await client.destroy();
            console.log('[INTERNAL RESTART] Discord client destroyed.');

            // 2. Re-require the bot entry point to "restart" the bot using absolute path
            setTimeout(() => {
                try {
                    console.log('[INTERNAL RESTART] Re-initializing bot...');
                    const botPath = path.resolve(__dirname, '../../../bot.js'); // Use absolute path to bot.js
                    delete require.cache[require.resolve(botPath)]; // Clear the cache to re-require the bot file
                    require(botPath); // Re-require the bot.js to restart the bot without exiting
                    console.log('[INTERNAL RESTART] Bot re-initialized successfully.');
                } catch (error) {
                    console.error('[INTERNAL RESTART] Error during bot re-initialization:', error);
                }
            }, 5000); // Delay to ensure the bot is disconnected before re-initializing
        } catch (error) {
            console.error('[INTERNAL RESTART] Unhandled error during internal restart process:', error);
        }
    },
};
