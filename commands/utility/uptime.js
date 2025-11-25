const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'uptime',
    description: 'Show bot uptime',
    async execute(message, args, client) {
        
    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);
    message.reply(`Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`);

    }
};