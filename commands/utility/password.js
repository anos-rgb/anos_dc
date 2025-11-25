const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'password',
    description: 'Generate password',
    async execute(message, args, client) {
        
    const length = parseInt(args[0]) || 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    try {
        await message.author.send('Your password: ' + retVal);
        message.reply('Sent to DM!');
    } catch (e) {
        message.reply('Cannot DM you! Here: ' + retVal);
    }

    }
};