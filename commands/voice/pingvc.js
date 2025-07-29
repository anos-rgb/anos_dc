module.exports = {
    name: 'pingvc',
    description: 'Ping semua member di voice channel',
    aliases: ['sebutvc'],
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

        const members = [...memberVoice.members.values()];
        if (members.length === 0) {
            return message.reply('❌ Tidak ada member di voice channel ini!');
        }

        try {
            let pingMessage = '';
            for (const member of members) {
                pingMessage += `${member.user.username}\n`;
            }

            const embed = {
                color: 0x00ff00,
                title: '🏓 PingVoice',
                description: `Ping ke semua member di **${memberVoice.name}**!\n\n` +
                           `${pingMessage}\n\n` +
                           `*Dipanggil oleh ${message.author}*`,
                footer: {
                    text: 'Ping VC - anos6501',
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Ping VC error:', error);
            message.reply('❌ Gagal melakukan ping!');
        }
    }
};