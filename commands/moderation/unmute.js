const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unmute',
    description: 'Unmute member di voice channel',
    usage: '!unmute <@user> [alasan]',
    permissions: [PermissionFlagsBits.MuteMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (!args[0]) {
            return message.reply('Silakan mention member yang ingin di-unmute! Contoh: `!unmute @user`');
        }

        const targetUser = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
        if (!targetUser) {
            return message.reply('Member tidak ditemukan!');
        }

        const alasan = args.slice(1).join(' ') || 'Tidak ada alasan';

        try {
            const member = await message.guild.members.fetch(targetUser.id);
            
            if (!member.voice.channel) {
                return message.reply('Member tersebut tidak berada di voice channel!');
            }

            if (!member.voice.serverMute) {
                return message.reply('Member tersebut tidak sedang di-mute!');
            }

            await member.voice.setMute(false, `${alasan} - Oleh: ${message.author.tag}`);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Member Telah Di-unmute')
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: 'Member', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Voice Channel', value: member.voice.channel.name, inline: true },
                    { name: 'Alasan', value: alasan, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat melakukan unmute!');
        }
    },
};