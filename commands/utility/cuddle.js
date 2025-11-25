const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'cuddle',
    description: 'cuddle someone',
    async execute(message, args, client) {
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('Mention someone to cuddle!');
        const embed = new EmbedBuilder()
            .setDescription(message.author.toString() + ' cuddles ' + user.toString() + '!')
            .setImage('https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif')
            .setColor('#FF69B4');
        message.reply({ embeds: [embed] });
    
    }
};