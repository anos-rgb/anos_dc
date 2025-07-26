const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'goodbye',
    description: 'Set goodbye channel dan pesan',
    usage: '!goodbye <#channel>',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!goodbye <#channel>`');
        }

        const channelMention = args[0];
        const channelId = channelMention.replace(/[<#>]/g, '');
        
        let channel;
        try {
            channel = await message.guild.channels.fetch(channelId);
        } catch (error) {
            return message.reply('❌ Channel tidak ditemukan!');
        }

        if (!channel.isTextBased()) {
            return message.reply('❌ Channel harus berupa text channel!');
        }

        const guildData = client.loadGuildData(message.guild.id);
        guildData.goodbyeChannel = channel.id;
        client.saveGuildData(message.guild.id, guildData);

        await message.reply(`✅ Goodbye channel berhasil diset ke ${channel}!`);
    }
};