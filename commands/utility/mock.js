const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'mock',
    description: 'Mock text',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    const text = args.join(' ').split('').map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('');
    message.reply(text);

    }
};