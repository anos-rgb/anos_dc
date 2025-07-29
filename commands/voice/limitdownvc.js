module.exports = {
    name: 'limitdownvc',
    description: 'Turunkan batas user di voice channel',
    aliases: ['turunilimit'],
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
            return message.reply('❌ Lo harus kasih angka limit! Contoh: `!limitdownvc 5`');
        }

        const currentLimit = memberVoice.userLimit;
        const newLimit = Math.max(0, currentLimit - parseInt(args[0]));
        if (isNaN(newLimit) || newLimit < 0) {
            return message.reply('❌ Limit harus lebih besar dari atau sama dengan 0!');
        }

        try {
            await memberVoice.setUserLimit(newLimit);

            const limitText = newLimit === 0 ? 'Unlimited' : newLimit.toString();
            
            const embed = {
                color: 0xff9900,
                title: '⏬ User Limit Diturunkan',
                description: `Batas user di voice channel **${memberVoice.name}** diturunkan!\n\n` +
                           `**Limit baru:** ${limitText}\n` +
                           `**Limit sebelumnya:** ${currentLimit === 0 ? 'Unlimited' : currentLimit}\n\n` +
                           `*Diturunkan oleh ${message.author}*`,
                footer: {
                    text: 'Limit Down VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Limit Down VC error:', error);
            message.reply('❌ Gagal menurunkan batas user voice channel!');
        }
    }
};