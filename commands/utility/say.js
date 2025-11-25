const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'say',
    description: 'Repeat message',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('What should I say?');
    message.channel.send(args.join(' '));

    }
};