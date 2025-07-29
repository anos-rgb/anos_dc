module.exports = {
    name: 'purgevc',
    description: 'Hapus semua member dari voice channel',
    aliases: ['bersihkancvc'],
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
            const members = memberVoice.members.filter(member => !member.user.bot);
            const memberCount = members.size;

            for (const [userId, member] of members) {
                await member.voice.disconnect('Purged from voice channel');
            }

            const embed = {
                color: 0x000000,
                title: '🧹 VC Dibersihkan',
                description: `Semua member (${memberCount} orang) di voice channel **${memberVoice.name}** telah dibersihkan!\n\n` +
                           `• Member tidak bisa join kembali kecuali channel dibuka kembali\n` +
                           `• Gunakan \`!unlockvc\` untuk membuka channel\n\n` +
                           `*Dibersihkan oleh ${message.author}*`,
                footer: {
                    text: 'Purge VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Purge VC error:', error);
            message.reply('❌ Gagal membersihkan voice channel!');
        }
    }
};