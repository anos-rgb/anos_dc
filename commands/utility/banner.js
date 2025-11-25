const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'banner',
    description: 'Show user banner',
    async execute(message, args, client) {
        
    const user = message.mentions.users.first() || message.author;
    const fullUser = await user.fetch();
    if (!fullUser.banner) return message.reply('User does not have a banner!');
    const embed = new EmbedBuilder()
        .setTitle(user.username + "'s Banner")
        .setImage(fullUser.bannerURL({ dynamic: true, size: 1024 }))
        .setColor('#00AAFF');
    message.reply({ embeds: [embed] });

    }
};