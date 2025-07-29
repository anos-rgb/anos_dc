module.exports = {
    name: 'unlockallvc',
    description: 'Buka semua voice channel yang terkunci',
    aliases: ['bukasemua'],
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
            const createdChannels = guildData.createdChannels;
            const unlockedCount = [];
            
            for (const userId in createdChannels) {
                const channel = message.guild.channels.cache.get(createdChannels[userId].channelId);
                if (channel) {
                    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                        CONNECT: true
                    });
                    unlockedCount.push(channel.name);
                }
            }

            const embed = {
                color: 0x00ff00,
                title: '🔓 Semua VC Terbuka',
                description: `Semua voice channel (${unlockedCount.length} channel) berhasil dibuka!\n\n` +
                           `**Channel yang terbuka:**\n${unlockedCount.join('\n') || 'Tidak ada channel yang terbuka'}\n\n` +
                           `Semua member sekarang bisa join ke voice channel.\n\n` +
                           `*Dibuka oleh ${message.author}*`,
                footer: {
                    text: 'Unlock All VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Unlock All VC error:', error);
            message.reply('❌ Gagal membuka semua voice channel!');
        }
    }
};