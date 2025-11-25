const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'kiss',
    description: 'kiss someone',
    async execute(message, args, client) {
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('Mention someone to kiss!');
        const embed = new EmbedBuilder()
            .setDescription(message.author.toString() + ' kisses ' + user.toString() + '!')
            .setImage('https://media.giphy.com/media/nyGFcsP0kAobm/giphy.gif')
            .setColor('#FF69B4');
        message.reply({ embeds: [embed] });
    
    }
};