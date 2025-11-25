const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'hex',
    description: 'Text to Hex',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    const text = Buffer.from(args.join(' ')).toString('hex');
    message.reply(text);

    }
};