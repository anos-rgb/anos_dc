const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'iq',
    description: 'Check IQ',
    async execute(message, args, client) {
        
    const score = Math.floor(Math.random() * 200);
    message.reply('🧠 Your IQ is: ' + score);

    }
};