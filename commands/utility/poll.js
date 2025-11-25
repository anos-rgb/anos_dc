const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'poll',
    description: 'Create poll',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide a poll question!');
    const embed = new EmbedBuilder()
        .setTitle('📊 Poll')
        .setDescription(args.join(' '))
        .setColor('#00AAFF')
        .setFooter({ text: 'Poll by ' + message.author.tag });
    const msg = await message.channel.send({ embeds: [embed] });
    await msg.react('👍');
    await msg.react('👎');

    }
};