const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'dm',
    description: 'DM a user',
    async execute(message, args, client) {
        
    const user = message.mentions.users.first();
    const text = args.slice(1).join(' ');
    if (!user || !text) return message.reply('Usage: !dm @user message');
    try {
        await user.send(text);
        message.reply('Sent!');
    } catch (e) {
        message.reply('Cannot DM this user.');
    }

    }
};