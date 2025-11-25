const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'randomnumber',
    description: 'Random number',
    async execute(message, args, client) {
        
    const min = parseInt(args[0]) || 1;
    const max = parseInt(args[1]) || 100;
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    message.reply('🔢 Random number: ' + result);

    }
};