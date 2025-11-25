const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'decode',
    description: 'Binary to text',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide binary!');
    try {
        const text = args.join(' ').split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
        message.reply(text);
    } catch (e) { message.reply('Invalid binary!'); }

    }
};