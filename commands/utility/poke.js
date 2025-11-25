const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'poke',
    description: 'poke someone',
    async execute(message, args, client) {
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('Mention someone to poke!');
        const embed = new EmbedBuilder()
            .setDescription(message.author.toString() + ' pokes ' + user.toString() + '!')
            .setImage('https://media.giphy.com/media/pWd3gD577gOqs/giphy.gif')
            .setColor('#FF69B4');
        message.reply({ embeds: [embed] });
    
    }
};