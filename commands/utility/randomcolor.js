const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'randomcolor',
    description: 'Random color',
    async execute(message, args, client) {
        
    const color = Math.floor(Math.random()*16777215).toString(16);
    const hex = '#' + color;
    const embed = new EmbedBuilder()
        .setTitle('Random Color')
        .setDescription(hex)
        .setColor(hex);
    message.reply({ embeds: [embed] });

    }
};