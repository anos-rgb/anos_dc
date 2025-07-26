const { PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'pindahuser',
    description: 'Pindahkan user ke voice channel lain',
    usage: '!pindahuser <@user> <channel_id/channel_name>',
    permissions: [PermissionFlagsBits.MoveMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: `!pindahuser <@user> <channel_id/channel_name>`');
        }

        const targetMention = args[0];
        const channelIdentifier = args.slice(1).join(' ');

        const targetId = targetMention.replace(/[<@!>]/g, '');
        
        let targetUser;
        try {
            targetUser = await message.client.users.fetch(targetId);
        } catch (error) {
            return message.reply('❌ User tidak ditemukan!');
        }

        const member = message.guild.members.cache.get(targetUser.id);

        if (!member) {
            return message.reply('❌ User tidak ditemukan di server ini!');
        }

        if (!member.voice.channel) {
            return message.reply('❌ User tidak berada di voice channel!');
        }

        let targetChannel;
        
        if (channelIdentifier.match(/^\d+$/)) {
            targetChannel = message.guild.channels.cache.get(channelIdentifier);
        } else {
            targetChannel = message.guild.channels.cache.find(channel => 
                channel.name.toLowerCase() === channelIdentifier.toLowerCase() && 
                channel.type === ChannelType.GuildVoice
            );
        }

        if (!targetChannel) {
            return message.reply('❌ Voice channel tidak ditemukan!');
        }

        if (targetChannel.type !== ChannelType.GuildVoice) {
            return message.reply('❌ Channel yang dipilih bukan voice channel!');
        }

        try {
            await member.voice.setChannel(targetChannel);
            await message.reply(`✅ Berhasil memindahkan ${targetUser.tag} ke ${targetChannel.name}`);
        } catch (error) {
            await message.reply('❌ Gagal memindahkan user! Pastikan bot memiliki izin yang cukup.');
        }
    },
};