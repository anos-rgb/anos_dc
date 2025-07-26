const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'voice',
    description: 'Kelola voice channel',
    usage: '!voice <mute|unmute|deafen|undeafen|disconnect|muteall|unmuteall|limit> [options]',
    permissions: [PermissionFlagsBits.MuteMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return message.reply('❌ Anda tidak memiliki izin untuk menggunakan command ini!');
        }

        if (!args.length) {
            return message.reply('❌ Silakan pilih subcommand: `mute`, `unmute`, `deafen`, `undeafen`, `disconnect`, `muteall`, `unmuteall`, `limit`');
        }

        const subcommand = args[0].toLowerCase();

        if (['mute', 'unmute', 'deafen', 'undeafen', 'disconnect'].includes(subcommand)) {
            const targetUser = message.mentions.users.first() || message.guild.members.cache.get(args[1])?.user;
            
            if (!targetUser) {
                return message.reply('❌ Silakan mention user atau berikan ID user yang valid!');
            }

            const member = message.guild.members.cache.get(targetUser.id);

            if (!member) {
                return message.reply('❌ User tidak ditemukan di server ini!');
            }

            if (!member.voice.channel) {
                return message.reply('❌ User tidak berada di voice channel!');
            }

            try {
                let action, emoji, status;

                switch (subcommand) {
                    case 'mute':
                        await member.voice.setMute(true);
                        action = 'di-mute';
                        emoji = '🔇';
                        status = 'muted';
                        break;
                    case 'unmute':
                        await member.voice.setMute(false);
                        action = 'di-unmute';
                        emoji = '🔊';
                        status = 'unmuted';
                        break;
                    case 'deafen':
                        await member.voice.setDeaf(true);
                        action = 'di-deafen';
                        emoji = '🔇';
                        status = 'deafened';
                        break;
                    case 'undeafen':
                        await member.voice.setDeaf(false);
                        action = 'di-undeafen';
                        emoji = '🔊';
                        status = 'undeafened';
                        break;
                    case 'disconnect':
                        await member.voice.disconnect();
                        action = 'di-disconnect';
                        emoji = '🚫';
                        status = 'disconnected';
                        break;
                }

                const embed = {
                    title: `${emoji} Voice Moderation`,
                    color: subcommand === 'disconnect' ? 0xff0000 : subcommand.includes('un') ? 0x00ff00 : 0xff9900,
                    fields: [
                        {
                            name: 'User',
                            value: `${targetUser.tag}`,
                            inline: true
                        },
                        {
                            name: 'Action',
                            value: action,
                            inline: true
                        },
                        {
                            name: 'Admin',
                            value: message.author.tag,
                            inline: true
                        }
                    ],
                    footer: { text: 'anos6501' },
                    timestamp: new Date()
                };

                await message.reply({ embeds: [embed] });

            } catch (error) {
                await message.reply('❌ Gagal melakukan aksi! Pastikan bot memiliki izin yang cukup.');
            }
        }

        if (subcommand === 'muteall' || subcommand === 'unmuteall') {
            let voiceChannel;
            
            if (args[1]) {
                const channelMention = message.mentions.channels.first();
                const channelById = message.guild.channels.cache.get(args[1]);
                
                if (channelMention) {
                    if (channelMention.type !== 2) {
                        return message.reply('❌ Channel yang dipilih bukan voice channel!');
                    }
                    voiceChannel = channelMention;
                } else if (channelById) {
                    if (channelById.type !== 2) {
                        return message.reply('❌ Channel yang dipilih bukan voice channel!');
                    }
                    voiceChannel = channelById;
                } else {
                    return message.reply('❌ Channel tidak ditemukan!');
                }
            } else {
                if (!message.member.voice.channel) {
                    return message.reply('❌ Anda harus berada di voice channel atau pilih channel target!');
                }
                voiceChannel = message.member.voice.channel;
            }

            const loadingMsg = await message.reply('⏳ Memproses...');

            const members = voiceChannel.members;
            let successCount = 0;
            let failCount = 0;

            const isMuting = subcommand === 'muteall';

            for (const [, member] of members) {
                try {
                    await member.voice.setMute(isMuting);
                    successCount++;
                } catch (error) {
                    failCount++;
                }
            }

            const embed = {
                title: `${isMuting ? '🔇' : '🔊'} ${isMuting ? 'Mute' : 'Unmute'} All`,
                color: isMuting ? 0xff9900 : 0x00ff00,
                fields: [
                    {
                        name: 'Channel',
                        value: voiceChannel.name,
                        inline: true
                    },
                    {
                        name: 'Berhasil',
                        value: successCount.toString(),
                        inline: true
                    },
                    {
                        name: 'Gagal',
                        value: failCount.toString(),
                        inline: true
                    }
                ],
                footer: { text: 'anos6501' },
                timestamp: new Date()
            };

            await loadingMsg.edit({ content: null, embeds: [embed] });
        }

        if (subcommand === 'limit') {
            const channelMention = message.mentions.channels.first();
            const channelById = message.guild.channels.cache.get(args[1]);
            const limit = parseInt(args[2]);

            if (!channelMention && !channelById) {
                return message.reply('❌ Silakan mention channel atau berikan ID channel yang valid!');
            }

            if (isNaN(limit) || limit < 0 || limit > 99) {
                return message.reply('❌ Limit harus berupa angka antara 0-99!');
            }

            const targetChannel = channelMention || channelById;

            if (targetChannel.type !== 2) {
                return message.reply('❌ Channel yang dipilih bukan voice channel!');
            }

            try {
                await targetChannel.setUserLimit(limit);

                const embed = {
                    title: '👥 User Limit Updated',
                    color: 0x0099ff,
                    fields: [
                        {
                            name: 'Channel',
                            value: targetChannel.name,
                            inline: true
                        },
                        {
                            name: 'Limit Baru',
                            value: limit === 0 ? 'Tidak terbatas' : limit.toString(),
                            inline: true
                        },
                        {
                            name: 'Admin',
                            value: message.author.tag,
                            inline: true
                        }
                    ],
                    footer: { text: 'anos6501' },
                    timestamp: new Date()
                };

                await message.reply({ embeds: [embed] });

            } catch (error) {
                await message.reply('❌ Gagal mengubah user limit!');
            }
        }
    },
};