module.exports = {
    name: 'limitupvc',
    description: 'Naikkan batas user di voice channel',
    aliases: ['naikkanlimit'],
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
            return message.reply('❌ Lo harus kasih angka limit! Contoh: `!limitupvc 5`');
        }

        const currentLimit = memberVoice.userLimit;
        const newLimit = currentLimit === 0 ? 5 : Math.min(99, currentLimit + parseInt(args[0]));
        if (isNaN(newLimit) || newLimit > 99) {
            return message.reply('❌ Limit maksimal adalah 99 user!');
        }

        try {
            await memberVoice.setUserLimit(newLimit);

            const limitText = newLimit === 0 ? 'Unlimited' : newLimit.toString();
            
            const embed = {
                color: 0x00ccff,
                title: '⬆️ User Limit Dinaikkan',
                description: `Batas user di voice channel **${memberVoice.name}** dinaikkan!\n\n` +
                           `**Limit baru:** ${limitText}\n` +
                           `**Limit sebelumnya:** ${currentLimit === 0 ? 'Unlimited' : currentLimit}\n\n` +
                           `*Dinaikkan oleh ${message.author}*`,
                footer: {
                    text: 'Limit Up VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Limit Up VC error:', error);
            message.reply('❌ Gagal menaikkan batas user voice channel!');
        }
    }
};