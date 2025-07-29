module.exports = {
    name: 'wipevc',
    description: 'Hapus semua data voice channel',
    aliases: ['hapussemuavec'],
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

        try {
            // Hapus semua created channels
            for (const userId in guildData.createdChannels) {
                const channel = message.guild.channels.cache.get(guildData.createdChannels[userId].channelId);
                if (channel) {
                    await channel.delete('Data VC dihapus oleh admin');
                }
            }

            // Hapus setup channel
            await message.guild.channels.cache.get(guildData.textChannelId).delete('Data VC dihapus oleh admin');
            await message.guild.channels.cache.get(guildData.voiceChannelId).delete('Data VC dihapus oleh admin');
            await message.guild.channels.cache.get(guildData.categoryId).delete('Data VC dihapus oleh admin');

            // Hapus data dari JSON
            delete data[message.guild.id];
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0x000000,
                title: '🗑️ Semua VC Dihapus',
                description: `Semua data voice channel berhasil dihapus!\n\n` +
                           `• Semua channel terkait dihapus\n` +
                           `• Data di reset total\n\n` +
                           `*Dihapus oleh ${message.author}*`,
                footer: {
                    text: 'Wipe VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Wipe VC error:', error);
            message.reply('❌ Gagal menghapus semua data voice channel!');
        }
    }
};