module.exports = {
    name: 'protectvc',
    description: 'Lindungi voice channel dari perubahan',
    aliases: ['lindungivc'],
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
            await memberVoice.permissionOverwrites.edit(guildData.voiceChannelId, {
                MANAGE_CHANNELS: false,
                MANAGE_PERMISSIONS: false
            });

            const embed = {
                color: 0x006600,
                title: '🛡️ VC Dilindungi',
                description: `Voice channel **${memberVoice.name}** sekarang dilindungi!\n\n` +
                           `• Tidak bisa diubah oleh bot atau admin\n` +
                           `• Hanya owner yang bisa mengubah pengaturan\n\n` +
                           `*Dilindungi oleh ${message.author}*`,
                footer: {
                    text: 'Protect VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Protect VC error:', error);
            message.reply('❌ Gagal melindungi voice channel!');
        }
    }
};