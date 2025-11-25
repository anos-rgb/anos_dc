const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'clap',
    description: 'Clap text',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    message.reply(args.join(' ').replace(/ /g, ' 👏 '));

    }
};