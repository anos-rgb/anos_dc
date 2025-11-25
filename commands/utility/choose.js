const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'choose',
    description: 'Choose option',
    async execute(message, args, client) {
        
    const options = args.join(' ').split(',');
    if (options.length < 2) return message.reply('Provide options separated by commas!');
    const choice = options[Math.floor(Math.random() * options.length)].trim();
    message.reply('I choose: ' + choice);

    }
};