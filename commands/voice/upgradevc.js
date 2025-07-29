module.exports = {
    name: 'upgradevc',
    description: 'Upgrade voice channel',
    aliases: ['tingkatkanvc'],
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
            // Tingkatkan bitrate
            const newBitrate = Math.min(memberVoice.bitrate + 8000, 96000);
            await memberVoice.setBitrate(newBitrate);

            // Tingkatkan user limit
            const newUserLimit = memberVoice.userLimit === 0 ? 50 : Math.min(memberVoice.userLimit + 5, 99);
            await memberVoice.setUserLimit(newUserLimit);

            const embed = {
                color: 0xffcc00,
                title: '⬆️ VC Diupgrade',
                description: `Voice channel **${memberVoice.name}** berhasil diupgrade!\n\n` +
                           `• Bitrate: ${(memberVoice.bitrate / 1000).toFixed(0)} kbps → ${(newBitrate / 1000).toFixed(0)} kbps\n` +
                           `• User Limit: ${memberVoice.userLimit === 0 ? 'Unlimited' : memberVoice.userLimit} → ${newUserLimit === 0 ? 'Unlimited' : newUserLimit}\n\n` +
                           `*Diupgrade oleh ${message.author}*`,
                footer: {
                    text: 'Upgrade VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Upgrade VC error:', error);
            message.reply('❌ Gagal mengupgrade voice channel!');
        }
    }
};