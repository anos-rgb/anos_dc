const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'dice',
    description: 'Roll a dice',
    async execute(message, args, client) {
        
    const result = Math.floor(Math.random() * 6) + 1;
    message.reply('🎲 You rolled a ' + result);

    }
};