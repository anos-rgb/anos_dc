const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'howgay',
    description: 'How gay are you',
    async execute(message, args, client) {
        
    const score = Math.floor(Math.random() * 101);
    message.reply('🏳️‍🌈 You are ' + score + '% gay!');

    }
};