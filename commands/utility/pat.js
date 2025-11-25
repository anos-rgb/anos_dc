const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'pat',
    description: 'pat someone',
    async execute(message, args, client) {
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('Mention someone to pat!');
        const embed = new EmbedBuilder()
            .setDescription(message.author.toString() + ' pats ' + user.toString() + '!')
            .setImage('https://media.giphy.com/media/5tmRHwTlHAA9WkVxTU/giphy.gif')
            .setColor('#FF69B4');
        message.reply({ embeds: [embed] });
    
    }
};