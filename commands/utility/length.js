const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'length',
    description: 'Count characters',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    message.reply('Length: ' + args.join(' ').length + ' characters');

    }
};