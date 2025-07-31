module.exports = {
  OWNER_IDS: [
  "1132413940693995541"
], // Bot owner ID's
  LOG_CHANNEL_ID: "1363598444387631104",
  SUPPORT_SERVER: "https://discord.gg/M7yyGfKdKx", // Your bot support server
  INVITE_URL: "https://discord.com/oauth2/authorize?client_id=1376465691221430372",
  STABLE_VERSION: "2.1.0", // Stable version of the bot
  PREFIX_COMMANDS: {
    ENABLED: true, // Enable/Disable prefix commands
    DEFAULT_PREFIX: "*", // Default prefix for the bot (changed to a typical prefix)
  },
  INTERACTIONS: {
    SLASH: true, // Should the interactions be enabled
    CONTEXT: true, // Should contexts be enabled
    GLOBAL: true, // Should the interactions be registered globally
    TEST_GUILD_ID: "1370610252587733024", // Guild ID where the interactions should be registered. [** Test your commands here first **]
  },
  EMBED_COLORS: {
    BOT_EMBED: "#068ADD",
    TRANSPARENT: "#36393F",
    SUCCESS: "#00A56A",
    ERROR: "#D61A3C",
    WARNING: "#F7E919",
    info: "#00BFFF", // ✅ Add this line to fix the error
  },
  
  CACHE_SIZE: {
    GUILDS: 100,
    USERS: 10000,
    MEMBERS: 10000,
  },

  // MUSIC
  MUSIC: {
    ENABLED: false,
  },
  
  MESSAGES: {
    API_ERROR: "Unexpected Backend Error! Try again later or contact support server",
  },

  DASHBOARD: {
    enabled: true, // enable or disable dashboard
    baseURL: process.env.DASHBOARD_BASE_URL || "https://tact.techoraye.com/", // base url
    failureURL: process.env.DASHBOARD_FAILURE_URL || "https://tact.techoraye.com/", // failure redirect url
    port: process.env.PORT || "20125", // port to run the bot on
  },

  // PLUGINS

  ECONOMY: {
    ENABLED: true,
    CURRENCY: "$",
    DAILY_COINS: 100, // coins to be received by daily command
    MIN_BEG_AMOUNT: 100, // minimum coins to be received when beg command is used
    MAX_BEG_AMOUNT: 2500, // maximum coins to be received when beg command is used
    MIN_SEARCH_AMOUNT: 50,
    MAX_SEARCH_AMOUNT: 300,
    WORK_MIN: 20,
    WORK_MAX: 120,
  },

  UTILITY: {
    ENABLED: true,
  },

  IMAGE: {
    ENABLED: true,
    BASE_API: "https://strangeapi.hostz.me/api",
  },

  INVITE: {
    ENABLED: false,
  },

  MODERATION: {
    ENABLED: true,
    EMBED_COLORS: {
      TIMEOUT: "#102027",
      UNTIMEOUT: "#4B636E",
      KICK: "#FF7961",
      SOFTBAN: "#AF4448",
      BAN: "#D32F2F",
      UNBAN: "#00C853",
      VMUTE: "#102027",
      VUNMUTE: "#4B636E",
      DEAFEN: "#102027",
      UNDEAFEN: "#4B636E",
      DISCONNECT: "RANDOM",
      MOVE: "RANDOM",
    },
  },
  AUTOMOD: {
    ENABLED: true,
    LOG_EMBED: "#36393F",
    DM_EMBED: "#36393F",
  },

  PRESENCE: {
    ENABLED: true, // Whether or not the bot should update its status
  },

  TICKET: {
    ENABLED: true,
    CREATE_EMBED: "#068ADD",
    CLOSE_EMBED: "#068ADD",
  },
   STATS: {
    ENABLED: true,
    XP_COOLDOWN: 5, // Cooldown in seconds between messages
    DEFAULT_LVL_UP_MSG: "{member:tag}, You just advanced to **Level {level}**",
  },
    SUGGESTIONS: {
    ENABLED: true, // Should the suggestion system be enabled
    EMOJI: {
      UP_VOTE: "⬆️",
      DOWN_VOTE: "⬇️",
    },
    DEFAULT_EMBED: "#4F545C",
    APPROVED_EMBED: "#43B581",
    DENIED_EMBED: "#F04747",
  },
};