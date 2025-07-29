module.exports = {
    name: 'tempvc',
    description: 'Buat voice channel sementara',
    aliases: ['vcsementara'],
    cooldown: 10,
    async execute(message, args, client) {
        const fs = require('fs');
        const path = './data/voicesetup.json';
        
        if (!fs.existsSync(path)) {
            return message.reply('❌ Voice system belum di-setup!');
        }
        
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        const guildData = data[message.guild.id];
        
        if (!guildData) {
            return message.reply('❌ Voice system belum di-setup untuk server ini!');
        }

        try {
            const duration = args[0] ? parseInt(args[0]) : 30; // Default 30 menit
            if (isNaN(duration) || duration < 1 || duration > 120) {
                return message.reply('❌ Durasi harus antara 1-120 menit! Contoh: `!tempvc 60` untuk 1 jam');
            }

            const tempChannel = await message.guild.channels.create(`Temp Channel (${duration}m)`, {
                type: 'GUILD_VOICE',
                parent: guildData.categoryId,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        allow: ['VIEW_CHANNEL', 'CONNECT']
                    }
                ]
            });

            // Hapus channel setelah durasi
            setTimeout(async () => {
                if (tempChannel.deleted) return;
                await tempChannel.delete('Waktu habis untuk channel sementara');
            }, duration * 60 * 1000);

            const embed = {
                color: 0xff6600,
                title: '⏳ VC Sementara Dibuat',
                description: `Voice channel sementara **${tempChannel.name}** berhasil dibuat!\n\n` +
                           `• Durasi: ${duration} menit\n` +
                           `• Akan dihapus otomatis setelah waktu habis\n\n` +
                           `*Dibuat oleh ${message.author}*`,
                footer: {
                    text: 'Temp VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Temp VC error:', error);
            message.reply('❌ Gagal membuat voice channel sementara!');
        }
    }
};