const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'rate',
    description: 'Rate something',
    async execute(message, args, client) {
        
    const thing = args.join(' ');
    if (!thing) return message.reply('What should I rate?');
    const score = Math.floor(Math.random() * 11);
    message.reply('I rate **' + thing + '** a **' + score + '/10**');

    }
};