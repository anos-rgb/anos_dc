const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'timeout',
    description: 'Timeout member untuk durasi tertentu',
    usage: '!timeout <@user> <durasi_menit> [alasan]',
    permissions: [PermissionFlagsBits.ModerateMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: `!timeout <@user> <durasi_menit> [alasan]`');
        }

        const targetMention = args[0];
        const durasi = parseInt(args[1]);
        const alasan = args.slice(2).join(' ') || 'Tidak ada alasan';

        const targetId = targetMention.replace(/[<@!>]/g, '');
        
        if (isNaN(durasi) || durasi < 1 || durasi > 40320) {
            return message.reply('Durasi harus berupa angka antara 1-40320 menit!');
        }

        let target;
        try {
            target = await message.client.users.fetch(targetId);
        } catch (error) {
            return message.reply('User tidak ditemukan!');
        }

        if (target.id === message.author.id) {
            return message.reply('Kamu tidak bisa timeout diri sendiri!');
        }

        if (target.id === message.client.user.id) {
            return message.reply('Kamu tidak bisa timeout bot!');
        }

        try {
            const member = await message.guild.members.fetch(target.id);
            
            if (member.roles.highest.position >= message.member.roles.highest.position) {
                return message.reply('Kamu tidak bisa timeout member yang memiliki role sama atau lebih tinggi!');
            }

            const timeoutEnd = new Date(Date.now() + durasi * 60 * 1000);
            await member.timeout(durasi * 60 * 1000, `${alasan} - Oleh: ${message.author.tag}`);

            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('Member Telah Di-timeout')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Member', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Durasi', value: `${durasi} menit`, inline: true },
                    { name: 'Berakhir', value: `<t:${Math.floor(timeoutEnd.getTime() / 1000)}:R>`, inline: true },
                    { name: 'Alasan', value: alasan, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat melakukan timeout!');
        }
    },
};