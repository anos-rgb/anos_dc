const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'weather',
    description: 'Mock weather',
    async execute(message, args, client) {
        
    const city = args.join(' ') || 'Jakarta';
    const embed = new EmbedBuilder()
        .setTitle('Weather in ' + city)
        .addFields(
            { name: 'Temperature', value: '30°C', inline: true },
            { name: 'Condition', value: 'Sunny', inline: true },
            { name: 'Humidity', value: '70%', inline: true }
        )
        .setColor('#FFA500');
    message.reply({ embeds: [embed] });

    }
};