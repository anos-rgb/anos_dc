module.exports = {
    name: 'lockallvc',
    description: 'Kunci semua voice channel yang terdaftar',
    aliases: ['locksemua'],
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
            const lockedCount = [];
            
            for (const userId in createdChannels) {
                const channel = message.guild.channels.cache.get(createdChannels[userId].channelId);
                if (channel) {
                    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                        CONNECT: false
                    });
                    lockedCount.push(channel.name);
                }
            }

            const embed = {
                color: 0xff0000,
                title: '🔒 Semua VC Terkunci',
                description: `Semua voice channel (${lockedCount.length} channel) berhasil dikunci!\n\n` +
                           `**Channel terkunci:**\n${lockedCount.join('\n') || 'Tidak ada channel yang dikunci'}\n\n` +
                           `Hanya member yang ada di dalam voice channel yang bisa tetap di situ.\n\n` +
                           `*Dikunci oleh ${message.author}*`,
                footer: {
                    text: 'Lock All VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Lock All VC error:', error);
            message.reply('❌ Gagal mengunci semua voice channel!');
        }
    }
};