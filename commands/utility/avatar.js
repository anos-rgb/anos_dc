const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'avatar',
    description: 'Show user avatar',
    async execute(message, args, client) {
        
    const user = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder()
        .setTitle(user.username + "'s Avatar")
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setColor('#00AAFF');
    message.reply({ embeds: [embed] });

    }
};