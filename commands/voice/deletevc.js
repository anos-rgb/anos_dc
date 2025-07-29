module.exports = {
    name: 'deletevc',
    description: 'Hapus voice channel lo - created by anos6501',
    aliases: ['delvc', 'delvoice'],
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
            const channelName = memberVoice.name;
            
            delete createdChannels[message.author.id];
            fs.writeFileSync(path, JSON.stringify(data, null, 2));
            
            await memberVoice.delete('Voice channel dihapus oleh owner');

            const embed = {
                color: 0xff4444,
                title: '🗑️ Voice Channel Dihapus',
                description: `Voice channel **${channelName}** berhasil dihapus!\n\n` +
                           `Channel telah dihapus dari sistem.\n` +
                           `Join ke **JOIN TO CREATE** untuk membuat voice baru.\n\n` +
                           `*Deleted by anos.py*`,
                footer: {
                    text: 'Voice Delete - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Delete VC error:', error);
            message.reply('❌ Gagal menghapus voice channel!');
        }
    }
};