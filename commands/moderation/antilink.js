const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'antilink',
    description: 'Toggle anti link system',
    usage: '!antilink <on/off>',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Anda tidak memiliki izin untuk menggunakan command ini!');
        }

        if (!args[0]) {
            return message.reply('❌ Harap masukkan status: `!antilink on` atau `!antilink off`');
        }

        const status = args[0].toLowerCase();
        
        if (status !== 'on' && status !== 'off') {
            return message.reply('❌ Status tidak valid! Gunakan `on` atau `off`');
        }

        const guildData = client.loadGuildData(message.guild.id);
        guildData.antiLink = status === 'on';
        client.saveGuildData(message.guild.id, guildData);

        const statusText = status === 'on' ? '✅ **DIAKTIFKAN**' : '❌ **DINONAKTIFKAN**';

        await message.reply(`Anti Link System ${statusText}`);
    }
};