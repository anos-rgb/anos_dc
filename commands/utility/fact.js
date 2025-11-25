const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'fact',
    description: 'Random fact',
    async execute(message, args, client) {
        
    const facts = [
        "Honey never spoils.",
        "Bananas are berries, but strawberries aren't.",
        "A group of flamingos is called a 'flamboyance'.",
        "Octopuses have three hearts.",
        "Wombat poop is cube-shaped."
    ];
    message.reply('💡 Fact: ' + facts[Math.floor(Math.random() * facts.length)]);

    }
};