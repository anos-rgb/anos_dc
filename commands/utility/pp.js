const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'pp',
    description: 'Check PP size',
    async execute(message, args, client) {
        
    const length = Math.floor(Math.random() * 15);
    const pp = '8' + '='.repeat(length) + 'D';
    message.reply('Your PP:\n' + pp);

    }
};