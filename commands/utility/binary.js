const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'binary',
    description: 'Text to binary',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    const text = args.join(' ').split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    message.reply(text);

    }
};