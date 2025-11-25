const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'uppercase',
    description: 'To Uppercase',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    message.reply(args.join(' ').toUpperCase());

    }
};