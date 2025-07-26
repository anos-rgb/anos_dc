const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cekjoin',
    description: 'Cek berapa lama seseorang telah berada di server',
    aliases: ['joindate', 'lamajoin'],
    cooldown: 5,

    async execute(message, args) {
        try {
            let targetUser;
            
            if (args[0]) {
                const userId = args[0].replace(/[<@!>]/g, '');
                targetUser = await message.client.users.fetch(userId).catch(() => null);
            } else {
                targetUser = message.author;
            }

            if (!targetUser) {
                return message.reply('User tidak ditemukan. Pastikan mention user dengan benar atau berikan ID yang valid.');
            }

            const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
            
            if (!member) {
                return message.reply('User tidak ditemukan di server ini.');
            }
            
            const joinDate = member.joinedAt;
            const currentDate = new Date();
            
            const durationMs = currentDate - joinDate;
            const seconds = Math.floor(durationMs / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const months = Math.floor(days / 30);
            const years = Math.floor(days / 365);
            
            let durationText = '';
            if (years > 0) {
                durationText += `${years} tahun `;
            }
            if (months % 12 > 0) {
                durationText += `${months % 12} bulan `;
            }
            if (days % 30 > 0) {
                durationText += `${days % 30} hari `;
            }
            if (hours % 24 > 0) {
                durationText += `${hours % 24} jam `;
            }
            if (minutes % 60 > 0) {
                durationText += `${minutes % 60} menit `;
            }
            if (seconds % 60 > 0) {
                durationText += `${seconds % 60} detik `;
            }
            
            const joinDateFormatted = joinDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Jakarta'
            });
            
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`Informasi Keanggotaan ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'User', value: `<@${targetUser.id}>`, inline: true },
                    { name: 'User ID', value: targetUser.id, inline: true },
                    { name: 'Bergabung pada', value: joinDateFormatted, inline: false },
                    { name: 'Durasi di server', value: durationText || 'Baru saja bergabung', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Diminta oleh ${message.author.tag}` });
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error dalam perintah cekjoin: ${error}`);
            await message.reply(`Terjadi kesalahan: ${error.message}`);
        }
    }
};