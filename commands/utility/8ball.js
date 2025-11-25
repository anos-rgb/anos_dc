const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: '8ball',
    description: 'Magic 8 Ball',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Ask a question!');
    const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Absolutely not', 'Try again later'];
    const answer = answers[Math.floor(Math.random() * answers.length)];
    message.reply('🎱 ' + answer);

    }
};