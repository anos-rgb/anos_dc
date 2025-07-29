module.exports = {
    name: 'voiceboost',
    description: 'Aktifkan voice boost',
    aliases: ['boostvc'],
    cooldown: 5,
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
            await memberVoice.setRtcRegion('automatic');
            await memberVoice.setBitrate(96000);

            const embed = {
                color: 0x00ffcc,
                title: '🔊 Voice Boost Aktif',
                description: `Voice boost di **${memberVoice.name}** telah diaktifkan!\n\n` +
                           `• Bitrate dinaikkan ke maksimal (96 kbps)\n` +
                           `• Region voice optimal\n\n` +
                           `Suara sekarang lebih jernih dan stabil.\n\n` +
                           `*Diboot oleh ${message.author}*`,
                footer: {
                    text: 'Voice Boost - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Voice Boost error:', error);
            message.reply('❌ Gagal mengaktifkan voice boost!');
        }
    }
};