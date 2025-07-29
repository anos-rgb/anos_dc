module.exports = {
    name: 'updatevc',
    description: 'Perbarui voice channel',
    aliases: ['perbaruivc'],
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
            await memberVoice.setName(`${memberVoice.name} (Updated)`);
            await memberVoice.setUserLimit(memberVoice.userLimit + 1);

            setTimeout(async () => {
                await memberVoice.setName(memberVoice.name.replace(' (Updated)', ''));
                await memberVoice.setUserLimit(memberVoice.userLimit - 1);
            }, 5000);

            const embed = {
                color: 0x00ff00,
                title: '🔄 VC Diperbarui',
                description: `Voice channel **${memberVoice.name}** berhasil diperbarui!\n\n` +
                           `• Nama channel sementara diubah\n` +
                           `• Batas user sementara ditambah\n` +
                           `• Akan dikembalikan dalam 5 detik\n\n` +
                           `*Diperbarui oleh ${message.author}*`,
                footer: {
                    text: 'Update VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Update VC error:', error);
            message.reply('❌ Gagal memperbarui voice channel!');
        }
    }
};