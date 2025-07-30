module.exports = {
  apps : [{
    name   : "tact-bot",
    script : "bot.js",
    watch  : true,
    autorestart: true,
    max_restarts: 10,
    env: {
      NODE_ENV: "production",
    }
  }]
}
