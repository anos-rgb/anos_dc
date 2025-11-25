const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'slap',
    description: 'slap someone',
    async execute(message, args, client) {
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('Mention someone to slap!');
        const embed = new EmbedBuilder()
            .setDescription(message.author.toString() + ' slaps ' + user.toString() + '!')
            .setImage('https://media.giphy.com/media/jLeyZWgtwgr2U/giphy.gif')
            .setColor('#FF69B4');
        message.reply({ embeds: [embed] });
    
    }
};