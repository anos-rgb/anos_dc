module.exports = {
    name: 'customvc',
    description: 'Atur pengaturan kustom untuk voice channel',
    aliases: ['setcustom'],
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

        let settingType, value;
        
        if (args.length === 0) {
            return message.reply('❌ Lo harus spesifikasikan pengaturan! Contoh: `!customvc bitrate 64` atau `!customvc region us-central`');
        }
        
        settingType = args[0].toLowerCase();
        
        if (settingType === 'bitrate') {
            if (args.length < 2) return message.reply('❌ Spesifikasikan nilai bitrate! (misal: 64, 96, 128)');
            value = parseInt(args[1]);
            if (isNaN(value) || value < 8 || value > 96) return message.reply('❌ Bitrate harus antara 8-96 kbps!');
        } else if (settingType === 'region') {
            if (args.length < 2) return message.reply('❌ Spesifikasikan region! (misal: us-central, singapore, sydney)');
            value = args.slice(1).join(' ');
        } else {
            return message.reply('❌ Pengaturan tidak dikenali! Pilihan: `bitrate`, `region`');
        }

        try {
            if (settingType === 'bitrate') {
                await memberVoice.setBitrate(value * 1000);
            } else if (settingType === 'region') {
                await memberVoice.setRTCRegion(value);
            }

            const embed = {
                color: 0x9932cc,
                title: '⚙️ VC Custom Setting',
                description: `Pengaturan kustom untuk voice channel **${memberVoice.name}** berhasil diubah!\n\n` +
                           `**Pengaturan:** ${settingType === 'bitrate' ? 'Bitrate' : 'Region'}\n` +
                           `**Nilai baru:** ${settingType === 'bitrate' ? value + ' kbps' : value}\n\n` +
                           `*Diatur oleh ${message.author}*`,
                footer: {
                    text: 'Custom VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Custom VC error:', error);
            message.reply('❌ Gagal mengubah pengaturan kustom voice channel!');
        }
    }
};