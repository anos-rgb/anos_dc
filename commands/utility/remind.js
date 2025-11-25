const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'remind',
    description: 'Set reminder',
    async execute(message, args, client) {
        
    const time = parseInt(args[0]);
    const reason = args.slice(1).join(' ') || 'Something';
    if (!time) return message.reply('Provide time in seconds!');
    message.reply('I will remind you about "' + reason + '" in ' + time + ' seconds.');
    setTimeout(() => {
        message.reply('⏰ Reminder: ' + reason);
    }, time * 1000);

    }
};