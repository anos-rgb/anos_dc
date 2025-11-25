const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'reverse',
    description: 'Reverse text',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    message.reply(args.join(' ').split('').reverse().join(''));

    }
};