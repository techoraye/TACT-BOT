const { Manager, Erela } = require('erela.js');

module.exports = class LavalinkClient {
  constructor(client) {
    this.client = client;
    this.manager = new Manager({
      nodes: [
        {
          host: 'localhost',
          port: 2333, // Lavalink server port
          password: 'youshallnotpass', // Lavalink password
        },
      ],
      send: (id, payload) => {
        const guild = this.client.guilds.cache.get(id);
        if (guild) {
          guild.shard.send(payload);
        }
      },
    });
    
    this.manager.on('nodeConnect', (node) => {
      console.log(`Node ${node.options.identifier} connected`);
    });

    this.manager.on('nodeDisconnect', (node) => {
      console.log(`Node ${node.options.identifier} disconnected`);
    });

    this.manager.on('trackStart', (player, track) => {
      console.log(`Now playing: ${track.title}`);
    });

    this.manager.on('trackEnd', (player, track) => {
      if (!player.queue.size) player.destroy();
    });

    this.manager.on('queueEnd', (player) => {
      player.destroy();
    });
  }

  // Connects a player to a voice channel
  connect(guildId, channelId) {
    const player = this.manager.create(guildId);
    player.connect(channelId);
    return player;
  }

  // Disconnects a player from the voice channel
  disconnect(guildId) {
    const player = this.manager.get(guildId);
    if (player) player.destroy();
  }
};
