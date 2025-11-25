const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'uuid',
    description: 'Generate UUID',
    async execute(message, args, client) {
        
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    message.reply(uuid);

    }
};