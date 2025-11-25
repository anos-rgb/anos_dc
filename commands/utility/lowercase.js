const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'lowercase',
    description: 'To Lowercase',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    message.reply(args.join(' ').toLowerCase());

    }
};