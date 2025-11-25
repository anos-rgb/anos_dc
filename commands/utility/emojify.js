const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'emojify',
    description: 'Text to emoji',
    async execute(message, args, client) {
        
    if (!args.length) return message.reply('Provide text!');
    const mapping = {
        'a': '🇦', 'b': '🇧', 'c': '🇨', 'd': '🇩', 'e': '🇪', 'f': '🇫', 'g': '🇬', 'h': '🇭', 'i': '🇮', 'j': '🇯', 'k': '🇰', 'l': '🇱', 'm': '🇲',
        'n': '🇳', 'o': '🇴', 'p': '🇵', 'q': '🇶', 'r': '🇷', 's': '🇸', 't': '🇹', 'u': '🇺', 'v': '🇻', 'w': '🇼', 'x': '🇽', 'y': '🇾', 'z': '🇿'
    };
    const text = args.join(' ').toLowerCase().split('').map(c => mapping[c] || c).join(' ');
    message.reply(text);

    }
};