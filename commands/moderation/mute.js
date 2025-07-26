const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Mute member di voice channel',
    usage: '!mute <@user> [alasan]',
    permissions: [PermissionFlagsBits.MuteMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!mute <@user> [alasan]`');
        }

        const targetMention = args[0];
        const alasan = args.slice(1).join(' ') || 'Tidak ada alasan';

        const targetId = targetMention.replace(/[<@!>]/g, '');

        let target;
        try {
            target = await message.client.users.fetch(targetId);
        } catch (error) {
            return message.reply('User tidak ditemukan!');
        }

        if (target.id === message.author.id) {
            return message.reply('Kamu tidak bisa mute diri sendiri!');
        }

        if (target.id === message.client.user.id) {
            return message.reply('Kamu tidak bisa mute bot!');
        }

        try {
            const member = await message.guild.members.fetch(target.id);
            
            if (!member.voice.channel) {
                return message.reply('Member tersebut tidak berada di voice channel!');
            }

            if (member.roles.highest.position >= message.member.roles.highest.position) {
                return message.reply('Kamu tidak bisa mute member yang memiliki role sama atau lebih tinggi!');
            }

            await member.voice.setMute(true, `${alasan} - Oleh: ${message.author.tag}`);

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Member Telah Di-mute')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Member', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Voice Channel', value: member.voice.channel.name, inline: true },
                    { name: 'Alasan', value: alasan, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat melakukan mute!');
        }
    },
};