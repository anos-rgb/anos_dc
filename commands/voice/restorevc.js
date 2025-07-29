module.exports = {
    name: 'restorevc',
    description: 'Pulihkan backup voice channel',
    aliases: ['pulihkancvc'],
    cooldown: 10,
    async execute(message, args, client) {
        const fs = require('fs');
        const path = './data/voicesetup.json';
        
        if (!fs.existsSync(path)) {
            return message.reply('❌ Voice system belum di-setup!');
        }
        
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        const guildData = data[message.guild.id];
        
        if (!guildData || message.channel.id !== guildData.textChannelId) {
            const textChannel = message.guild.channels.cache.get(guildData?.textChannelId);
            return message.reply(`❌ Command ini hanya bisa digunakan di ${textChannel}!`);
        }
        
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply('❌ Lo butuh permission `MANAGE_CHANNELS` buat ini!');
        }

        const backupFiles = fs.readdirSync('./data/backup/')
            .filter(file => file.startsWith(`${message.guild.id}_backup_`) && file.endsWith('.json'));
        
        if (backupFiles.length === 0) {
            return message.reply('❌ Tidak ada backup yang tersedia!');
        }

        let selectedBackup;
        if (backupFiles.length === 1) {
            selectedBackup = backupFiles[0];
        } else {
            const listEmbed = {
                color: 0x00ffff,
                title: '📋 Daftar Backup Tersedia',
                description: 'Pilih nomor backup yang mau dipulihkan:\n' +
                           backupFiles.map((file, index) => `${index + 1}. ${file.replace('.json', '')}`).join('\n')
            };
            
            message.reply({ embeds: [listEmbed] });
            
            const filter = m => m.author.id === message.author.id && 
                             !isNaN(m.content) && 
                             parseInt(m.content) > 0 && 
                             parseInt(m.content) <= backupFiles.length;
            
            try {
                const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
                const choice = parseInt(collected.first().content) - 1;
                selectedBackup = backupFiles[choice];
            } catch {
                return message.reply('❌ Waktu habis atau pilihan tidak valid!');
            }
        }

        try {
            const backupPath = `./data/backup/${selectedBackup}`;
            const backupData = JSON.parse(fs.readFileSync(backupPath));
            
            // Pulihkan category
            const category = message.guild.channels.cache.get(backupData.categoryId);
            if (category) {
                await category.setName('CREATE VOICE (Restored)');
            } else {
                return message.reply('❌ Category asli tidak ditemukan! Buat setup baru dengan `!setup`.');
            }
            
            // Pulihkan text channel
            const textChannel = message.guild.channels.cache.get(backupData.textChannelId);
            if (textChannel) {
                await textChannel.setName('voice-settings (Restored)');
            }
            
            // Pulihkan voice channel utama
            const voiceChannel = message.guild.channels.cache.get(backupData.voiceChannelId);
            if (voiceChannel) {
                await voiceChannel.setName('JOIN TO CREATE (Restored)');
            }
            
            // Pulihkan created channels
            for (const userId in backupData.createdChannels) {
                const channel = message.guild.channels.cache.get(backupData.createdChannels[userId].channelId);
                if (channel) {
                    await channel.setName(`Restored Channel`);
                }
            }

            // Update data
            data[message.guild.id] = backupData;
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0x00ff00,
                title: '✅ Backup VC Dipulihkan',
                description: `Backup voice channel berhasil dipulihkan dari file **${selectedBackup}**!\n\n` +
                           `• Semua channel telah dipulihkan\n` +
                           `• Nama channel ditambahkan "(Restored)"\n\n` +
                           `*Dipulihkan oleh ${message.author}*`,
                footer: {
                    text: 'Restore VC - anos6501',
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Restore VC error:', error);
            message.reply('❌ Gagal memulihkan backup voice channel!');
        }
    }
};