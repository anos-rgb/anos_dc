const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'spoiler',
    description: 'Spoiler text',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    message.reply('||' + args.join(' ') + '||');

    }
};