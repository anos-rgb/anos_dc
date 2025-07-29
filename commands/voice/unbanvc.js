module.exports = {
    name: 'unbanvc',
    description: 'Unban user dari voice channel lo - created by anos6501',
    aliases: ['vcunban', 'unbanvoice'],
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
            return message.reply('❌ Lo harus mention user yang mau di-unban! Contoh: `!unbanvc @user`');
        }

        const channelData = createdChannels[channelOwner];
        if (!channelData.bannedUsers || !channelData.bannedUsers.includes(targetUser.id)) {
            return message.reply('❌ User ini tidak di-ban dari voice channel lo!');
        }

        try {
            await memberVoice.permissionOverwrites.edit(targetUser.id, {
                CONNECT: null,
                VIEW_CHANNEL: null
            });

            channelData.bannedUsers = channelData.bannedUsers.filter(id => id !== targetUser.id);
            
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0x00ff00,
                title: '✅ User Unbanned from Voice',
                description: `**${targetUser.tag}** berhasil di-unban dari voice channel!\n\n` +
                           `**Channel:** ${memberVoice.name}\n` +
                           `**Unbanned by:** ${message.author}\n` +
                           `**Target:** ${targetUser}\n\n` +
                           `User sekarang bisa join ke voice channel ini lagi.\n\n` +
                           `*Unbanned via anos.py*`,
                footer: {
                    text: 'Voice Unban - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Unban VC error:', error);
            message.reply('❌ Gagal unban user dari voice channel!');
        }
    }
};