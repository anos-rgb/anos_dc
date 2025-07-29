module.exports = {
    name: 'infovc',
    description: 'Info lengkap voice channel lo - created by anos6501',
    aliases: ['vcinfo', 'voiceinfo'],
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
        
        if (!channelOwner) {
            return message.reply('❌ Ini bukan voice channel yang dibuat dari sistem!');
        }

        try {
            const channelData = createdChannels[channelOwner];
            const owner = message.guild.members.cache.get(channelOwner);
            const createdDate = new Date(channelData.createdAt);
            
            const members = memberVoice.members.map(member => member.displayName).join('\n') || 'Tidak ada';
            const bannedUsers = channelData.bannedUsers || [];
            const bannedList = bannedUsers.length > 0 ? 
                bannedUsers.map(id => {
                    const user = message.guild.members.cache.get(id);
                    return user ? user.displayName : 'Unknown User';
                }).join('\n') : 'Tidak ada';

            const isLocked = !memberVoice.permissionsFor(message.guild.roles.everyone).has('CONNECT');
            const userLimit = memberVoice.userLimit === 0 ? 'Unlimited' : memberVoice.userLimit;

            const embed = {
                color: 0x4169e1,
                title: `ℹ️ Voice Channel Info - ${memberVoice.name}`,
                fields: [
                    {
                        name: '👑 Owner',
                        value: owner ? owner.toString() : 'Unknown',
                        inline: true
                    },
                    {
                        name: '📅 Created',
                        value: `<t:${Math.floor(createdDate.getTime() / 1000)}:R>`,
                        inline: true
                    },
                    {
                        name: '🔒 Status',
                        value: isLocked ? 'Locked' : 'Unlocked',
                        inline: true
                    },
                    {
                        name: '👥 User Limit',
                        value: userLimit,
                        inline: true
                    },
                    {
                        name: '🎯 Current Members',
                        value: `${memberVoice.members.size} members`,
                        inline: true
                    },
                    {
                        name: '🚫 Banned Users',
                        value: `${bannedUsers.length} users`,
                        inline: true
                    },
                    {
                        name: '📋 Members List',
                        value: `\`\`\`${members}\`\`\``,
                        inline: false
                    }
                ],
                footer: {
                    text: 'Voice Info - anos6501 | anos.py',
                    icon_url: client.user.displayAvatarURL()
                },
                timestamp: new Date()
            };

            if (bannedUsers.length > 0) {
                embed.fields.push({
                    name: '🚫 Banned Users List',
                    value: `\`\`\`${bannedList}\`\`\``,
                    inline: false
                });
            }

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Info VC error:', error);
            message.reply('❌ Gagal mendapatkan info voice channel!');
        }
    }
};