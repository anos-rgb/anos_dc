module.exports = {
    name: 'banvc',
    description: 'Ban user dari voice channel lo - created by anos6501',
    aliases: ['vcban', 'banvoice'],
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
            return message.reply('❌ Lo harus mention user yang mau di-ban! Contoh: `!banvc @user`');
        }

        if (targetUser.id === message.author.id) {
            return message.reply('❌ Lo gabisa ban diri sendiri dari voice channel lo sendiri!');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('❌ User tidak ditemukan di server ini!');
        }

        const channelData = createdChannels[channelOwner];
        if (channelData.bannedUsers && channelData.bannedUsers.includes(targetUser.id)) {
            return message.reply('❌ User ini sudah di-ban dari voice channel lo!');
        }

        try {
            if (memberVoice.members.has(targetUser.id)) {
                await targetMember.voice.disconnect('Banned from voice channel');
            }

            await memberVoice.permissionOverwrites.edit(targetUser.id, {
                CONNECT: false,
                VIEW_CHANNEL: true
            });

            if (!channelData.bannedUsers) {
                channelData.bannedUsers = [];
            }
            channelData.bannedUsers.push(targetUser.id);
            
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0xff0000,
                title: '🚫 User Banned from Voice',
                description: `**${targetUser.tag}** berhasil di-ban dari voice channel!\n\n` +
                           `**Channel:** ${memberVoice.name}\n` +
                           `**Banned by:** ${message.author}\n` +
                           `**Target:** ${targetUser}\n\n` +
                           `User tidak bisa join ke voice channel ini lagi.\n` +
                           `Gunakan \`!unbanvc @user\` untuk unban.\n\n` +
                           `*Banned via anos.py*`,
                footer: {
                    text: 'Voice Ban - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Ban VC error:', error);
            message.reply('❌ Gagal ban user dari voice channel!');
        }
    }
};