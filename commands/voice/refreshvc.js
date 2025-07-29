module.exports = {
    name: 'refreshvc',
    description: 'Perbarui data voice channel',
    aliases: ['perbaruivc'],
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
        
        if (channelOwner !== message.author.id && !message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply('❌ Lo bukan owner dari voice channel ini atau tidak punya permission!');
        }

        try {
            // Perbarui data di JSON
            createdChannels[channelOwner] = {
                channelId: memberVoice.id,
                ownerId: channelOwner,
                createdAt: createdChannels[channelOwner]?.createdAt || Date.now(),
                bannedUsers: createdChannels[channelOwner]?.bannedUsers || []
            };
            
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0x00ff00,
                title: '🔄 VC Diperbarui',
                description: `Data voice channel **${memberVoice.name}** berhasil diperbarui!\n\n` +
                           `• Informasi terbaru telah tersimpan\n` +
                           `• Gunakan \`!infovc\` untuk melihat detail\n\n` +
                           `*Diperbarui oleh ${message.author}*`,
                footer: {
                    text: 'Refresh VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Refresh VC error:', error);
            message.reply('❌ Gagal memperbarui data voice channel!');
        }
    }
};