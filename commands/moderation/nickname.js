const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nickname',
    description: 'Ubah nickname member',
    usage: '!nickname <@user> [nickname] [alasan]',
    permissions: [PermissionFlagsBits.ManageNicknames],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!nickname <@user> [nickname] [alasan]`');
        }

        const targetMention = args[0];
        const targetId = targetMention.replace(/[<@!>]/g, '');
        
        let target;
        try {
            target = await message.client.users.fetch(targetId);
        } catch (error) {
            return message.reply('User tidak ditemukan!');
        }

        if (target.id === message.client.user.id) {
            return message.reply('Kamu tidak bisa mengubah nickname bot!');
        }

        const nicknameArg = args[1];
        let nickname = null;
        let alasan = 'Tidak ada alasan';

        if (nicknameArg) {
            if (nicknameArg.length > 32) {
                return message.reply('Nickname tidak boleh lebih dari 32 karakter!');
            }
            nickname = nicknameArg;
            alasan = args.slice(2).join(' ') || 'Tidak ada alasan';
        } else {
            alasan = args.slice(1).join(' ') || 'Tidak ada alasan';
        }

        try {
            const member = await message.guild.members.fetch(target.id);

            if (member.roles.highest.position >= message.member.roles.highest.position && target.id !== message.author.id) {
                return message.reply('Kamu tidak bisa mengubah nickname member yang memiliki role sama atau lebih tinggi!');
            }

            if (target.id === message.guild.ownerId) {
                return message.reply('Kamu tidak bisa mengubah nickname owner server!');
            }

            const oldNickname = member.nickname || member.user.username;
            await member.setNickname(nickname, `${alasan} - Oleh: ${message.author.tag}`);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Nickname Berhasil Diubah')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Member', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Nickname Lama', value: oldNickname, inline: true },
                    { name: 'Nickname Baru', value: nickname || target.username, inline: true },
                    { name: 'Alasan', value: alasan, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat mengubah nickname!');
        }
    },
};