const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'ship',
    description: 'Ship two users',
    async execute(message, args, client) {
        
    const user1 = message.mentions.users.first() || message.author;
    const user2 = message.mentions.users.last() === user1 ? message.author : message.mentions.users.last();
    const score = Math.floor(Math.random() * 101);
    const embed = new EmbedBuilder()
        .setTitle('❤️ Ship Calculator')
        .setDescription(user1.toString() + ' ❤️ ' + user2.toString() + '\n\n**Score: ' + score + '%**')
        .setColor('#FF0000');
    message.reply({ embeds: [embed] });

    }
};