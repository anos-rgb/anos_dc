const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'massban',
    description: 'Ban beberapa user sekaligus',
    usage: '!massban <userid1> <userid2> [userid3...] [alasan]',
    permissions: [PermissionFlagsBits.BanMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!massban <userid1> <userid2> [userid3...] [alasan]`');
        }

        const userIds = [];
        let reason = 'Tidak ada alasan yang diberikan';
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (/^\d{17,19}$/.test(arg)) {
                userIds.push(arg);
            } else {
                reason = args.slice(i).join(' ');
                break;
            }
        }

        if (userIds.length === 0) {
            return message.reply('❌ Tidak ada user ID yang valid ditemukan!');
        }

        if (userIds.length > 10) {
            return message.reply('❌ Maksimal 10 user per perintah!');
        }

        const processingMsg = await message.reply('🔄 Memproses mass ban...');

        const results = [];
        
        for (const userId of userIds) {
            try {
                const user = await message.client.users.fetch(userId);
                await message.guild.members.ban(user, { reason: reason });
                results.push(`✅ ${user.tag} (${userId})`);
            } catch (error) {
                results.push(`❌ ${userId} - Gagal di-ban`);
            }
        }

        const embed = {
            title: '🔨 Hasil Mass Ban',
            description: results.join('\n'),
            color: 0xff0000,
            fields: [
                {
                    name: 'Alasan',
                    value: reason,
                    inline: false
                },
                {
                    name: 'Admin',
                    value: message.author.tag,
                    inline: true
                }
            ],
            footer: { text: 'anos6501' },
            timestamp: new Date()
        };

        await processingMsg.edit({ content: null, embeds: [embed] });
    },
};