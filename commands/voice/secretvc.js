module.exports = {
    name: 'secretvc',
    description: 'Buat voice channel rahasia',
    aliases: ['rahasiavec'],
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
            await memberVoice.permissionOverwrites.edit(message.guild.roles.everyone, {
                VIEW_CHANNEL: false,
                CONNECT: false
            });

            const embed = {
                color: 0x000000,
                title: '🔒 VC Rahasia',
                description: `Voice channel **${memberVoice.name}** sekarang rahasia!\n\n` +
                           `• Tidak visible bagi member lain\n` +
                           `• Hanya owner yang tahu channel ini ada\n\n` +
                           `*Dirahasiakan oleh ${message.author}*`,
                footer: {
                    text: 'Secret VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Secret VC error:', error);
            message.reply('❌ Gagal membuat voice channel rahasia!');
        }
    }
};