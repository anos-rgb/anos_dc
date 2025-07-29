module.exports = {
    name: 'watchvc',
    description: 'Pantau aktivitas voice channel',
    aliases: ['pantauvc'],
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
            const members = memberVoice.members.map(member => member.user.tag).join(', ') || 'Tidak ada member';
            const activity = memberVoice.members.size > 0 ? 'Aktif' : 'Tidak ada aktivitas';
            
            const embed = {
                color: 0x00ff00,
                title: '👁️‍🗨️ Pantau VC',
                description: `Aktivitas voice channel **${memberVoice.name}**:\n\n` +
                           `• Member: ${members}\n` +
                           `• Status: ${activity}\n` +
                           `• Durasi aktif: ${(Date.now() - createdChannels[channelOwner].createdAt) / 60000} menit\n\n` +
                           `Pemantauan dilakukan oleh ${message.author}`,
                footer: {
                    text: 'Watch VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Watch VC error:', error);
            message.reply('❌ Gagal memantau aktivitas voice channel!');
        }
    }
};