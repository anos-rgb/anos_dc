const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'serverbanner',
    description: 'Show server banner',
    async execute(message, args, client) {
        
    if (!message.guild.banner) return message.reply('Server does not have a banner!');
    const embed = new EmbedBuilder()
        .setTitle(message.guild.name + "'s Banner")
        .setImage(message.guild.bannerURL({ dynamic: true, size: 1024 }))
        .setColor('#00AAFF');
    message.reply({ embeds: [embed] });

    }
};