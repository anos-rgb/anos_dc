const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'base64decode',
    description: 'Base64 to text',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide Base64!');
    const text = Buffer.from(args.join(' '), 'base64').toString('utf-8');
    message.reply(text);

    }
};