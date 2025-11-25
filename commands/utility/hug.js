const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'hug',
    description: 'hug someone',
    async execute(message, args, client) {
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('Mention someone to hug!');
        const embed = new EmbedBuilder()
            .setDescription(message.author.toString() + ' hugs ' + user.toString() + '!')
            .setImage('https://media.giphy.com/media/3M4NpbLCTxBqU/giphy.gif')
            .setColor('#FF69B4');
        message.reply({ embeds: [embed] });
    
    }
};