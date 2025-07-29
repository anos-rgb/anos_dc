module.exports = {
    name: 'unlockvc',
    description: 'Buka kunci voice channel lo - created by anos6501',
    aliases: ['unlockvoice'],
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

        try {
            await memberVoice.permissionOverwrites.edit(message.guild.roles.everyone, {
                CONNECT: true
            });

            const embed = {
                color: 0x00ff00,
                title: '🔓 Voice Channel Terbuka',
                description: `Voice channel **${memberVoice.name}** berhasil dibuka!\n\n` +
                           `Semua member sekarang bisa join ke voice channel ini.\n` +
                           `Gunakan \`!lockvc\` untuk mengunci kembali.\n\n` +
                           `*Unlocked by anos.py*`,
                footer: {
                    text: 'Voice Unlock - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Unlock VC error:', error);
            message.reply('❌ Gagal membuka kunci voice channel!');
        }
    }
};