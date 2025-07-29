module.exports = {
    name: 'denyvc',
    description: 'Tolak permintaan akses voice channel',
    aliases: ['tolakvc'],
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

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ Lo harus mention user yang mau ditolak! Contoh: `!denyvc @user`');
        }

        const channelData = createdChannels[channelOwner];
        if (channelData.pendingRequests && channelData.pendingRequests.includes(targetUser.id)) {
            channelData.pendingRequests = channelData.pendingRequests.filter(id => id !== targetUser.id);
            
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0xcc0000,
                title: '❌ Akses Ditolak',
                description: `Permintaan akses **${targetUser.tag}** ke voice channel **${memberVoice.name}** ditolak!\n\n` +
                           `**Ditolak oleh:** ${message.author}\n\n` +
                           `*Tolak akses via anos.py*`,
                footer: {
                    text: 'Deny VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } else {
            message.reply('❌ Tidak ada permintaan akses dari user ini!');
        }
    }
};