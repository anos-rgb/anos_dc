const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'afk',
    description: 'Set AFK',
    async execute(message, args, client) {
        
    const reason = args.join(' ') || 'AFK';
    message.reply('You are now AFK: ' + reason);

    }
};