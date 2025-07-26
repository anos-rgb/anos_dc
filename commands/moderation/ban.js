const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Ban member dari server',
    usage: '!ban <@user> [hapus_pesan_hari] [alasan]',
    permissions: [PermissionFlagsBits.BanMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!ban <@user> [hapus_pesan_hari] [alasan]`');
        }

        const targetMention = args[0];
        const targetId = targetMention.replace(/[<@!>]/g, '');
        
        let hapusPesan = 0;
        let alasan = 'Tidak ada alasan';
        
        if (args.length > 1) {
            const secondArg = parseInt(args[1]);
            if (!isNaN(secondArg) && secondArg >= 0 && secondArg <= 7) {
                hapusPesan = secondArg;
                alasan = args.slice(2).join(' ') || 'Tidak ada alasan';
            } else {
                alasan = args.slice(1).join(' ') || 'Tidak ada alasan';
            }
        }

        let target;
        try {
            target = await message.client.users.fetch(targetId);
        } catch (error) {
            return message.reply('User tidak ditemukan!');
        }

        if (target.id === message.author.id) {
            return message.reply('Kamu tidak bisa ban diri sendiri!');
        }

        if (target.id === message.client.user.id) {
            return message.reply('Kamu tidak bisa ban bot!');
        }

        try {
            const member = await message.guild.members.fetch(target.id);
            
            if (member.roles.highest.position >= message.member.roles.highest.position) {
                return message.reply('Kamu tidak bisa ban member yang memiliki role sama atau lebih tinggi!');
            }

            await member.ban({ 
                reason: `${alasan} - Oleh: ${message.author.tag}`,
                deleteMessageSeconds: hapusPesan * 24 * 60 * 60
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Member Telah Di-ban')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Member', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Alasan', value: alasan, inline: false },
                    { name: 'Pesan Dihapus', value: `${hapusPesan} hari`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat melakukan ban!');
        }
    },
};