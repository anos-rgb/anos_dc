const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'ping',
    description: 'Show bot latency',
    async execute(message, args, client) {
        
    message.reply(`Pong! Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);

    }
};