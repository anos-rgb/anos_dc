const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'base64',
    description: 'Text to Base64',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    const text = Buffer.from(args.join(' ')).toString('base64');
    message.reply(text);

    }
};