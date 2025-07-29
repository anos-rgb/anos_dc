module.exports = {
    name: 'reportvc',
    description: 'Laporkan penggunaan voice channel',
    aliases: ['laporvc'],
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
        
        const memberVoice = message.member.voice.channel;
        if (!memberVoice) {
            return message.reply('❌ Lo harus ada di voice channel dulu!');
        }
        
        const createdChannels = guildData.createdChannels;
        const channelOwner = Object.keys(createdChannels).find(userId => 
            createdChannels[userId].channelId === memberVoice.id
        );
        
        if (channelOwner !== message.author.id) {
            return message.reply('❌ Lo bukan owner dari voice channel ini!');
        }

        try {
            const targetUser = message.mentions.users.first();
            if (!targetUser) {
                return message.reply('❌ Lo harus mention user yang mau dilaporkan! Contoh: `!reportvc @user alasan`');
            }

            const reason = args.slice(1).join(' ') || 'Tidak ada alasan ditulis';
            
            const embed = {
                color: 0xff0000,
                title: '🚨 VC Dilaporkan',
                description: `**${targetUser.tag}** dilaporkan di voice channel **${memberVoice.name}**!\n\n` +
                           `**Alasan:** ${reason}\n` +
                           `**Dilaporkan oleh:** ${message.author}\n\n` +
                           `*Laporan ini akan dikirim ke admin server*`,
                footer: {
                    text: 'Report VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            // Kirim ke channel logs jika ada
            const logsChannel = message.guild.channels.cache.find(c => c.name === 'voice-logs');
            if (logsChannel) {
                logsChannel.send({ embeds: [embed] });
            }

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Report VC error:', error);
            message.reply('❌ Gagal melaporkan user di voice channel!');
        }
    }
};