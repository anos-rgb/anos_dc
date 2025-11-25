const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'feed',
    description: 'feed someone',
    async execute(message, args, client) {
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('Mention someone to feed!');
        const embed = new EmbedBuilder()
            .setDescription(message.author.toString() + ' feeds ' + user.toString() + '!')
            .setImage('https://media.giphy.com/media/1fC2tJ3h76Xqo/giphy.gif')
            .setColor('#FF69B4');
        message.reply({ embeds: [embed] });
    
    }
};