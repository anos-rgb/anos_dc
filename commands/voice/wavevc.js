module.exports = {
    name: 'wavevc',
    description: 'Getari member di voice channel',
    aliases: ['getarvc'],
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
            
            for (const [memberId, member] of members) {
                await member.voice.setDeaf(true);
                await new Promise(resolve => setTimeout(resolve, 500));
                await member.voice.setDeaf(false);
                await new Promise(resolve => setTimeout(resolve, 500));
                await member.voice.setDeaf(true);
                await new Promise(resolve => setTimeout(resolve, 500));
                await member.voice.setDeaf(false);
            }

            const embed = {
                color: 0x0000ff,
                title: '🌊 VC Digetarkan',
                description: `Semua member di voice channel **${memberVoice.name}** digetarkan!\n\n` +
                           `• Member bergetar beberapa kali\n` +
                           `• Efek akan berhenti setelah beberapa detik\n\n` +
                           `*Dilakukan oleh ${message.author}*`,
                footer: {
                    text: 'Wave VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Wave VC error:', error);
            message.reply('❌ Gagal menggetarkan member di voice channel!');
        }
    }
};