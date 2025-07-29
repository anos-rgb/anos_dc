module.exports = {
    name: 'shufflevc',
    description: 'Acak member di voice channel',
    aliases: ['acakvc'],
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
            const members = memberVoice.members.filter(member => !member.user.bot).array();
            if (members.length < 2) {
                return message.reply('❌ Minimal perlu 2 member untuk mengacak!');
            }

            // Acak urutan member
            for (let i = members.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [members[i], members[j]] = [members[j], members[i]];
            }

            // Pindahkan member ke channel yang sama (untuk memicu susunan baru)
            for (const member of members) {
                await member.voice.setChannel(memberVoice);
            }

            const embed = {
                color: 0xff00ff,
                title:                '🔀 Member Diacak',
                description: `Member di voice channel **${memberVoice.name}** telah diacak!\n\n` +
                           `• Total member diacak: ${members.length}\n` +
                           `• Acakan dilakukan oleh: ${message.author}\n\n` +
                           `Member sekarang tersebar secara acak di channel.\n\n` +
                           `*Diacak oleh ${message.author}*`,
                footer: {
                    text: 'Shuffle VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Shuffle VC error:', error);
            message.reply('❌ Gagal mengacak member di voice channel!');
        }
    }
};