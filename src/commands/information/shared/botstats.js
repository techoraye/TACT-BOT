const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionFlagsBits } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER, INVITE_URL } = require("@root/config");
const { timeformat } = require("@helpers/Utils");
const os = require("os");
const { stripIndent } = require("common-tags");

/**
 * Génère un embed très complet avec des stats système & bot.
 * @param {import('@structures/BotClient')} client
 * @param {boolean} isInteraction - true if used in an interaction (for ephemeral)
 * @returns {{ embeds: EmbedBuilder[], components: ActionRowBuilder[], flags?: number }}
 */
module.exports = (client, isInteraction = false) => {
  // === GENERAL BOT STATS ===
  const guilds = client.guilds.cache.size;
  const channels = client.channels.cache.size;
  const users = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
  const ping = client.ws.ping;
  const uptime = timeformat(process.uptime());
  const nodeVersion = process.version;

  // === CPU ===
  const cpus = os.cpus();
  const cpuModel = cpus[0].model;
  const cpuCores = cpus.length;
  const cpuSpeed = cpus[0].speed;
  const cpuArch = os.arch();
  const cpuPlatform = process.platform === "win32" ? "Windows" : process.platform;
  const loadAverage = os.loadavg().map((n) => n.toFixed(2)).join(" / ");
  const cpuUsage = (process.cpuUsage().user / 1024 / 1024).toFixed(2) + " MB";

  // === MEMORY ===
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usedGB = (usedMem / 1024 / 1024 / 1024).toFixed(2);
  const totalGB = (totalMem / 1024 / 1024 / 1024).toFixed(2);
  const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

  // === BOT MEMORY ===
  const heapUsed = process.memoryUsage().heapUsed;
  const heapTotal = process.memoryUsage().heapTotal;
  const externalMem = process.memoryUsage().external;
  const botUsedMB = (heapUsed / 1024 / 1024).toFixed(2);
  const botTotalMB = (heapTotal / 1024 / 1024).toFixed(2);
  const externalMB = (externalMem / 1024 / 1024).toFixed(2);
  const botMemPercent = ((heapUsed / totalMem) * 100).toFixed(2);

  // === EMBED CONTENT ===
  const embed = new EmbedBuilder()
    .setTitle("🧠 Bot & System Statistics")
    .setColor(EMBED_COLORS.BOT_EMBED || "#5865F2")
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      {
        name: "📊 General Bot Info",
        value: stripIndent`
          ❯ Servers: \`${guilds}\`
          ❯ Users: \`${users}\`
          ❯ Channels: \`${channels}\`
          ❯ WebSocket Ping: \`${ping}ms\`
          ❯ Node.js: \`${nodeVersion}\`
          ❯ Uptime: \`${uptime}\`
        `,
      },
      {
        name: "🧠 CPU Information",
        value: stripIndent`
          ❯ Model: \`${cpuModel}\`
          ❯ Cores: \`${cpuCores}\` @ \`${cpuSpeed} MHz\`
          ❯ Architecture: \`${cpuArch}\`
          ❯ Platform: \`${cpuPlatform}\`
          ❯ Load Average: \`${loadAverage}\`
          ❯ Bot CPU Usage: \`${cpuUsage}\`
        `,
      },
      {
        name: "💾 Memory (System)",
        value: stripIndent`
          ❯ Used: \`${usedGB} GB\`
          ❯ Total: \`${totalGB} GB\`
          ❯ Usage: \`${memUsagePercent}%\`
        `,
        inline: true,
      },
      {
        name: "📦 Memory (Bot Process)",
        value: stripIndent`
          ❯ Heap Used: \`${botUsedMB} MB\`
          ❯ Heap Total: \`${botTotalMB} MB\`
          ❯ External: \`${externalMB} MB\`
          ❯ Usage: \`${botMemPercent}% of system RAM\`
        `,
        inline: true,
      },
      {
        name: "🧩 Sharding",
        value: `❯ This bot is **${client.shard ? "sharded" : "not sharded"}**${
          client.shard ? ` (Shard ${client.shard.ids[0]})` : ""
        }`,
      }
    )
    .setFooter({
      text: `Requested by ${client.user.username}`,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTimestamp();

  // === BUTTONS ===
  const buttonsList = [];

  buttonsList.push(
    new ButtonBuilder().setLabel("🔗 Invite Me").setURL(INVITE_URL).setStyle(ButtonStyle.Link) // ✅ updated here
  );

  if (SUPPORT_SERVER) {
    buttonsList.push(
      new ButtonBuilder().setLabel("💬 Support").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link)
    );
  }

  // Split buttons into rows
  const rows = [];
  for (let i = 0; i < buttonsList.length; i += 5) {
    const row = new ActionRowBuilder().addComponents(buttonsList.slice(i, i + 5));
    rows.push(row);
  }

  // Return the embed and buttons
  const payload = {
    embeds: [embed],
    components: rows,
  };

  if (isInteraction) {
    payload.flags = InteractionFlagsBits.Ephemeral;
  }

  return payload;
};
