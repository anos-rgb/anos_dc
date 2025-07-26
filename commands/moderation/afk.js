const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'afk',
    description: 'Atur status AFK atau keluar dari status AFK',
    aliases: ['away', 'brb'],
    cooldown: 3,

    async execute(message, args) {
        try {
            let db;
            try {
                db = JSON.parse(fs.readFileSync('./data/anosae.json', 'utf8'));
            } catch {
                db = { afkUsers: {} };
            }

            if (!db.afkUsers) {
                db.afkUsers = {};
            }

            const userId = message.author.id;
            const member = message.member;
            const currentNickname = member.nickname || member.user.username;

            if (db.afkUsers[userId]) {
                delete db.afkUsers[userId];
                fs.writeFileSync('./data/anosae.json', JSON.stringify(db, null, 4));

                try {
                    if (currentNickname.startsWith('[AFK]')) {
                        const newNickname = currentNickname.replace('[AFK] ', '').replace('[AFK]', '');
                        await member.setNickname(newNickname || null);
                    }
                } catch (nicknameError) {
                    console.error('Tidak bisa mengubah nickname:', nicknameError);
                }

                const welcomeBackEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('👋 Selamat Datang Kembali!')
                    .setDescription(`<@${userId}> sudah tidak AFK lagi!`)
                    .addFields(
                        { name: '⏰ Waktu Kembali', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'anosbot AFK System' });

                return message.reply({ embeds: [welcomeBackEmbed] });
            }

            const reason = args.join(' ') || 'Tidak ada alasan yang diberikan';

            db.afkUsers[userId] = {
                userId: userId,
                username: message.author.username,
                reason: reason,
                since: Date.now()
            };

            fs.writeFileSync('./data/anosae.json', JSON.stringify(db, null, 4));

            const afkEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🌙 Status AFK Diaktifkan')
                .setDescription(`<@${userId}> sekarang AFK!`)
                .addFields(
                    { name: '📝 Alasan', value: reason },
                    { name: '⏰ Waktu AFK', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
                )
                .setTimestamp()
                .setFooter({ text: 'anosbot AFK System' });

            await message.reply({ embeds: [afkEmbed] });

            try {
                if (!currentNickname.includes('[AFK]')) {
                    await member.setNickname(`[AFK] ${currentNickname}`);
                }
            } catch (nicknameError) {
                console.error('Tidak bisa mengubah nickname:', nicknameError);
            }

        } catch (error) {
            console.error('Error saat menjalankan command afk:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Terjadi Kesalahan')
                .setDescription('Gagal mengatur status AFK! Silakan coba lagi.')
                .addFields(
                    { name: '🔍 Detail Error', value: `\`\`\`${error.message.substring(0, 900)}\`\`\`` }
                )
                .setTimestamp()
                .setFooter({ text: 'anosbot Error System' });

            await message.reply({ embeds: [errorEmbed] });
        }
    },
};