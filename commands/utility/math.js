const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'math',
    description: 'Simple math',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide expression!');
    try {
        // Very simple and unsafe eval replacement or just restricted chars
        const expr = args.join('').replace(/[^0-9+\-*/().]/g, '');
        if (!expr) return message.reply('Invalid characters!');
        const result = eval(expr); // Still eval, but filtered.
        message.reply('Result: ' + result);
    } catch (e) { message.reply('Error!'); }

    }
};