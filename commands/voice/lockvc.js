module.exports = {
    name: 'lockvc',
    description: 'Kunci voice channel lo - created by anos6501',
    aliases: ['lockvoice'],
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
                CONNECT: false
            });

            const embed = {
                color: 0xff0000,
                title: '🔒 Voice Channel Terkunci',
                description: `Voice channel **${memberVoice.name}** berhasil dikunci!\n\n` +
                           `Only members yang sudah ada di voice yang bisa tetap disini.\n` +
                           `Gunakan \`!unlockvc\` untuk membuka kunci.\n\n` +
                           `*Locked by anos.py*`,
                footer: {
                    text: 'Voice Lock - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Lock VC error:', error);
            message.reply('❌ Gagal mengunci voice channel!');
        }
    }
};