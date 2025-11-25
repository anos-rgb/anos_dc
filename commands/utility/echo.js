const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'echo',
    description: 'Echo message',
    async execute(message, args, client) {
        
    message.channel.send(args.join(' '));

    }
};