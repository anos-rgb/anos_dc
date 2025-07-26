const { PermissionFlagsBits } = require('discord.js');

const activityData = new Map();

module.exports = {
    name: 'aktivitas',
    description: 'Monitor aktivitas server',
    aliases: ['activity', 'stats'],
    usage: '!aktivitas <user/server/channel/reset> [target]',
    permissions: [PermissionFlagsBits.ManageGuild],

    async execute(message, args) {
        const subcommand = args[0];
        const guildId = message.guild.id;

        if (!activityData.has(guildId)) {
            activityData.set(guildId, {
                users: new Map(),
                channels: new Map(),
                totalMessages: 0,
                startTime: Date.now()
            });
        }

        const guildData = activityData.get(guildId);

        if (subcommand === 'user') {
            const targetUser = message.mentions.users.first() || message.guild.members.cache.get(args[1])?.user;
            
            if (!targetUser) {
                return message.reply('❌ Silakan mention user atau berikan ID user yang valid!');
            }

            const userData = guildData.users.get(targetUser.id);

            if (!userData) {
                return message.reply('❌ Tidak ada data aktivitas untuk user ini!');
            }

            const embed = {
                title: `📊 Aktivitas User - ${targetUser.tag}`,
                color: 0x0099ff,
                thumbnail: { url: targetUser.displayAvatarURL() },
                fields: [
                    {
                        name: 'Total Pesan',
                        value: userData.messages.toString(),
                        inline: true
                    },
                    {
                        name: 'Terakhir Aktif',
                        value: `<t:${Math.floor(userData.lastActivity / 1000)}:R>`,
                        inline: true
                    },
                    {
                        name: 'Bergabung Server',
                        value: `<t:${Math.floor(message.guild.members.cache.get(targetUser.id)?.joinedTimestamp / 1000)}:F>`,
                        inline: false
                    }
                ],
                footer: { text: 'anos6501' },
                timestamp: new Date()
            };

            if (userData.channels && userData.channels.size > 0) {
                const topChannels = Array.from(userData.channels.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([channelId, count]) => {
                        const channel = message.guild.channels.cache.get(channelId);
                        return `<#${channelId}>: ${count} pesan`;
                    });

                embed.fields.push({
                    name: 'Channel Paling Aktif',
                    value: topChannels.join('\n') || 'Tidak ada data',
                    inline: false
                });
            }

            await message.reply({ embeds: [embed] });
        }

        else if (subcommand === 'server') {
            const totalUsers = guildData.users.size;
            const totalMessages = guildData.totalMessages;
            const startTime = guildData.startTime;

            const topUsers = Array.from(guildData.users.entries())
                .sort((a, b) => b[1].messages - a[1].messages)
                .slice(0, 5)
                .map(([userId, data], index) => {
                    const user = message.client.users.cache.get(userId);
                    return `${index + 1}. ${user?.tag || 'Unknown'}: ${data.messages} pesan`;
                });

            const embed = {
                title: '📊 Aktivitas Server',
                color: 0x00ff00,
                fields: [
                    {
                        name: 'Total Pesan',
                        value: totalMessages.toString(),
                        inline: true
                    },
                    {
                        name: 'User Aktif',
                        value: totalUsers.toString(),
                        inline: true
                    },
                    {
                        name: 'Monitoring Sejak',
                        value: `<t:${Math.floor(startTime / 1000)}:F>`,
                        inline: false
                    },
                    {
                        name: 'Top 5 User Paling Aktif',
                        value: topUsers.join('\n') || 'Tidak ada data',
                        inline: false
                    }
                ],
                footer: { text: 'anos6501' },
                timestamp: new Date()
            };

            await message.reply({ embeds: [embed] });
        }

        else if (subcommand === 'channel') {
            const targetChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.channel;
            const channelData = guildData.channels.get(targetChannel.id);

            if (!channelData) {
                return message.reply('❌ Tidak ada data aktivitas untuk channel ini!');
            }

            const embed = {
                title: `📊 Aktivitas Channel - #${targetChannel.name}`,
                color: 0xff9900,
                fields: [
                    {
                        name: 'Total Pesan',
                        value: channelData.messages.toString(),
                        inline: true
                    },
                    {
                        name: 'User Unik',
                        value: channelData.uniqueUsers.toString(),
                        inline: true
                    },
                    {
                        name: 'Pesan Terakhir',
                        value: `<t:${Math.floor(channelData.lastMessage / 1000)}:R>`,
                        inline: false
                    }
                ],
                footer: { text: 'anos6501' },
                timestamp: new Date()
            };

            await message.reply({ embeds: [embed] });
        }

        else if (subcommand === 'reset') {
            activityData.set(guildId, {
                users: new Map(),
                channels: new Map(),
                totalMessages: 0,
                startTime: Date.now()
            });

            const embed = {
                title: '🔄 Data Aktivitas Direset',
                description: 'Semua data aktivitas telah direset dan monitoring dimulai ulang.',
                color: 0xff0000,
                footer: { text: 'anos6501' },
                timestamp: new Date()
            };

            await message.reply({ embeds: [embed] });
        }

        else {
            const embed = {
                title: '❓ Cara Penggunaan Command Aktivitas',
                description: 'Gunakan salah satu subcommand berikut:',
                color: 0x0099ff,
                fields: [
                    {
                        name: '!aktivitas user [@user/userID]',
                        value: 'Lihat aktivitas user tertentu',
                        inline: false
                    },
                    {
                        name: '!aktivitas server',
                        value: 'Lihat aktivitas server',
                        inline: false
                    },
                    {
                        name: '!aktivitas channel [#channel/channelID]',
                        value: 'Lihat aktivitas channel (default: channel saat ini)',
                        inline: false
                    },
                    {
                        name: '!aktivitas reset',
                        value: 'Reset semua data aktivitas',
                        inline: false
                    }
                ],
                footer: { text: 'anos6501' },
                timestamp: new Date()
            };

            await message.reply({ embeds: [embed] });
        }
    },

    trackMessage(message) {
        if (message.author.bot) return;

        const guildId = message.guild.id;
        const userId = message.author.id;
        const channelId = message.channel.id;

        if (!activityData.has(guildId)) {
            activityData.set(guildId, {
                users: new Map(),
                channels: new Map(),
                totalMessages: 0,
                startTime: Date.now()
            });
        }

        const guildData = activityData.get(guildId);

        if (!guildData.users.has(userId)) {
            guildData.users.set(userId, {
                messages: 0,
                channels: new Map(),
                lastActivity: Date.now()
            });
        }

        if (!guildData.channels.has(channelId)) {
            guildData.channels.set(channelId, {
                messages: 0,
                uniqueUsers: 0,
                users: new Set(),
                lastMessage: Date.now()
            });
        }

        const userData = guildData.users.get(userId);
        const channelData = guildData.channels.get(channelId);

        userData.messages++;
        userData.lastActivity = Date.now();

        if (!userData.channels.has(channelId)) {
            userData.channels.set(channelId, 0);
        }
        userData.channels.set(channelId, userData.channels.get(channelId) + 1);

        channelData.messages++;
        channelData.lastMessage = Date.now();
        
        if (!channelData.users.has(userId)) {
            channelData.users.add(userId);
            channelData.uniqueUsers++;
        }

        guildData.totalMessages++;
    }
};