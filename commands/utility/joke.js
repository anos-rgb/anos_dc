const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'joke',
    description: 'Random joke',
    async execute(message, args, client) {
        
    const jokes = [
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "Why don't scientists trust atoms? Because they make up everything!",
        "What do you call a fake noodle? An impasta!",
        "Why did the math book look sad? Because it had too many problems."
    ];
    message.reply('😂 ' + jokes[Math.floor(Math.random() * jokes.length)]);

    }
};