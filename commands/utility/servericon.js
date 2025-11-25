const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'servericon',
    description: 'Show server icon',
    async execute(message, args, client) {
        
    if (!message.guild.icon) return message.reply('Server does not have an icon!');
    const embed = new EmbedBuilder()
        .setTitle(message.guild.name + "'s Icon")
        .setImage(message.guild.iconURL({ dynamic: true, size: 1024 }))
        .setColor('#00AAFF');
    message.reply({ embeds: [embed] });

    }
};