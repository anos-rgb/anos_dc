module.exports = {
    name: 'transfervc',
    description: 'Transfer ownership voice channel - created by anos6501',
    aliases: ['transfervoice', 'givevc'],
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

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ Lo harus mention user yang mau dijadiin owner! Contoh: `!transfervc @user`');
        }

        if (targetUser.id === message.author.id) {
            return message.reply('❌ Lo udah jadi owner, ngapain transfer ke diri sendiri?');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('❌ User tidak ditemukan di server ini!');
        }

        if (!memberVoice.members.has(targetUser.id)) {
            return message.reply('❌ User yang lo mention harus ada di voice channel ini!');
        }

        try {
            await memberVoice.permissionOverwrites.edit(message.author.id, {
                MANAGE_CHANNELS: null,
                MANAGE_PERMISSIONS: null,
                MUTE_MEMBERS: null,
                DEAFEN_MEMBERS: null,
                MOVE_MEMBERS: null
            });

            await memberVoice.permissionOverwrites.edit(targetUser.id, {
                MANAGE_CHANNELS: true,
                MANAGE_PERMISSIONS: true,
                MUTE_MEMBERS: true,
                DEAFEN_MEMBERS: true,
                MOVE_MEMBERS: true
            });

            delete createdChannels[message.author.id];
            createdChannels[targetUser.id] = {
                channelId: memberVoice.id,
                ownerId: targetUser.id,
                createdAt: Date.now(),
                bannedUsers: createdChannels[channelOwner]?.bannedUsers || []
            };
            
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0x9932cc,
                title: '👑 Ownership Transferred',
                description: `Ownership voice channel **${memberVoice.name}** berhasil ditransfer!\n\n` +
                           `**Old Owner:** ${message.author}\n` +
                           `**New Owner:** ${targetUser}\n\n` +
                           `${targetUser} sekarang bisa mengatur voice channel ini.\n\n` +
                           `*Transferred via anos.py*`,
                footer: {
                    text: 'Voice Transfer - anos6501',
                    icon_url: targetUser.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Transfer VC error:', error);
            message.reply('❌ Gagal transfer ownership voice channel!');
        }
    }
};