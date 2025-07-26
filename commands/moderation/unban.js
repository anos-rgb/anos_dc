const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unban user dari server',
    usage: '!unban <userid> [alasan]',
    permissions: [PermissionFlagsBits.BanMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('Anda tidak memiliki izin untuk menggunakan command ini!');
        }

        if (!args[0]) {
            return message.reply('Silakan masukkan ID user yang akan di-unban!\nUsage: `!unban <userid> [alasan]`');
        }

        const userId = args[0];
        const alasan = args.slice(1).join(' ') || 'Tidak ada alasan';

        if (!/^\d{17,19}$/.test(userId)) {
            return message.reply('ID user tidak valid!');
        }

        try {
            const banList = await message.guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                return message.reply('User tersebut tidak di-ban di server ini!');
            }

            await message.guild.bans.remove(userId, `${alasan} - Oleh: ${message.author.tag}`);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('User Telah Di-unban')
                .addFields(
                    { name: 'User', value: `${bannedUser.user.tag} (${bannedUser.user.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Alasan', value: alasan, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat melakukan unban!');
        }
    },
};