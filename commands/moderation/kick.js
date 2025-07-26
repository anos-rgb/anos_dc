const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kick member dari server',
    usage: '!kick <@user> [alasan]',

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!kick <@user> [alasan]`');
        }

        const userMention = args[0];
        const userId = userMention.replace(/[<@!>]/g, '');
        const target = await message.client.users.fetch(userId).catch(() => null);

        if (!target) {
            return message.reply('User tidak ditemukan!');
        }

        const alasan = args.slice(1).join(' ') || 'Tidak ada alasan';

        if (target.id === message.author.id) {
            return message.reply('Kamu tidak bisa kick diri sendiri!');
        }

        if (target.id === message.client.user.id) {
            return message.reply('Kamu tidak bisa kick bot!');
        }

        try {
            const member = await message.guild.members.fetch(target.id);
            
            if (member.roles.highest.position >= message.member.roles.highest.position) {
                return message.reply('Kamu tidak bisa kick member yang memiliki role sama atau lebih tinggi!');
            }

            await member.kick(`${alasan} - Oleh: ${message.author.tag}`);

            const embed = new EmbedBuilder()
                .setColor(0xFF9500)
                .setTitle('Member Telah Di-kick')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Member', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Alasan', value: alasan, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat melakukan kick!');
        }
    },
};