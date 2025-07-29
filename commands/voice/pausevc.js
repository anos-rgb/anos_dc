module.exports = {
    name: 'pausevc',
    description: 'Istirahatkan voice channel',
    aliases: ['istirahatvc'],
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
            // Simpan status saat ini
            createdChannels[channelOwner].paused = true;
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0xffcc00,
                title: '⏸️ VC Diistirahatkan',
                description: `Voice channel **${memberVoice.name}** sekarang dalam mode istirahat!\n\n` +
                           `• Semua member tidak bisa bicara kecuali owner\n` +
                           `• Gunakan \`!resumevc\` untuk melanjutkan\n\n` +
                           `*Istirahatkan oleh ${message.author}*`,
                footer: {
                    text: 'Pause VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Pause VC error:', error);
            message.reply('❌ Gagal mengistirahatkan voice channel!');
        }
    }
};