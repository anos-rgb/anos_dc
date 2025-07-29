module.exports = {
    name: 'limitvc',
    description: 'Set user limit voice channel lo - created by anos6501',
    aliases: ['vcLimit', 'setlimit'],
    cooldown: 3,
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

        if (!args[0]) {
            return message.reply('❌ Lo harus kasih angka limit! Contoh: `!limitvc 5` atau `!limitvc 0` untuk unlimited');
        }

        const limit = parseInt(args[0]);
        if (isNaN(limit) || limit < 0 || limit > 99) {
            return message.reply('❌ Limit harus berupa angka antara 0-99! (0 = unlimited)');
        }

        try {
            await memberVoice.setUserLimit(limit);

            const limitText = limit === 0 ? 'Unlimited' : limit.toString();
            
            const embed = {
                color: 0x00aaff,
                title: '👥 User Limit Updated',
                description: `User limit untuk voice channel **${memberVoice.name}** berhasil diubah!\n\n` +
                           `**New Limit:** ${limitText}\n` +
                           `**Current Members:** ${memberVoice.members.size}\n\n` +
                           `${limit === 0 ? 'Voice channel sekarang unlimited members.' : `Maksimal ${limit} members yang bisa join.`}\n\n` +
                           `*Updated by anos.py*`,
                footer: {
                    text: 'Voice Limit - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Limit VC error:', error);
            message.reply('❌ Gagal mengubah user limit voice channel!');
        }
    }
};