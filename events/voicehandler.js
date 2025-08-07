const fs = require('fs');
const { ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const path = './data/voicesetup.json';
        
        if (!fs.existsSync(path)) return;
        
        let data;
        try {
            data = JSON.parse(fs.readFileSync(path, 'utf8'));
        } catch (error) {
            console.error('Error reading voice setup data:', error);
            return;
        }
        
        const guildData = data[newState.guild.id];
        if (!guildData) return;

        if (newState.channelId === guildData.voiceChannelId && !oldState.channelId) {
            try {
                const member = newState.member;
                const guild = newState.guild;
                const category = guild.channels.cache.get(guildData.categoryId);
                
                if (!category) return;

                const existingChannelData = Object.values(guildData.createdChannels).find(ch => ch.ownerId === member.id);
                if (existingChannelData) {
                    const existingChannel = guild.channels.cache.get(existingChannelData.channelId);
                    if (existingChannel) {
                        await member.voice.setChannel(existingChannel);
                        return;
                    }
                }

                const voiceChannel = await guild.channels.create({
                    name: `${member.displayName}'s voice`,
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: member.id,
                            allow: [
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.ManageRoles,
                                PermissionFlagsBits.MuteMembers,
                                PermissionFlagsBits.DeafenMembers,
                                PermissionFlagsBits.MoveMembers
                            ]
                        },
                        {
                            id: guild.roles.everyone.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.Connect,
                                PermissionFlagsBits.Speak
                            ]
                        }
                    ]
                });

                guildData.createdChannels[member.id] = {
                    channelId: voiceChannel.id,
                    ownerId: member.id,
                    createdAt: Date.now(),
                    bannedUsers: []
                };
                
                fs.writeFileSync(path, JSON.stringify(data, null, 2));

                await member.voice.setChannel(voiceChannel);

                const textChannel = guild.channels.cache.get(guildData.textChannelId);
                if (textChannel) {
                    const embed = {
                        color: 0x00ff00,
                        title: '🔊 Voice Channel Dibuat',
                        description: `Voice channel **${voiceChannel.name}** berhasil dibuat untuk ${member}!\n\n` +
                                   `Gunakan \`!myvc\` untuk mengatur channel lo.`,
                        footer: {
                            text: 'Voice System - anos6501',
                            icon_url: member.user.displayAvatarURL()
                        },
                        timestamp: new Date()
                    };
                    
                    textChannel.send({ embeds: [embed] });
                }

            } catch (error) {
                console.error('Voice create error:', error);
            }
        }

        if (oldState.channelId && !newState.channelId) {
            const channelData = Object.entries(guildData.createdChannels).find(([userId, data]) => 
                data.channelId === oldState.channelId
            );
            
            if (channelData) {
                const [ownerId, channelInfo] = channelData;
                const channel = oldState.guild.channels.cache.get(oldState.channelId);
                
                if (channel) {
                    try {
                        if (channel.members.size === 0 && !channelInfo.protected) {
                            delete guildData.createdChannels[ownerId];
                            fs.writeFileSync(path, JSON.stringify(data, null, 2));
                            
                            await channel.delete('Voice channel kosong - dihapus otomatis');

                            const textChannel = oldState.guild.channels.cache.get(guildData.textChannelId);
                            if (textChannel) {
                                const embed = {
                                    color: 0xff9900,
                                    title: '🗑️ Voice Channel Dihapus Otomatis',
                                    description: `Voice channel **${channel.name}** dihapus karena kosong.`,
                                    footer: {
                                        text: 'Voice System - anos6501',
                                        icon_url: client.user.displayAvatarURL()
                                    },
                                    timestamp: new Date()
                                };
                                
                                textChannel.send({ embeds: [embed] });
                            }
                        }
                    } catch (error) {
                        console.error('Voice delete error:', error);
                    }
                }
            }
        }

        if (oldState.channelId !== newState.channelId) {
            try {
                const oldChannelData = Object.entries(guildData.createdChannels).find(([userId, data]) => 
                    data.channelId === oldState.channelId
                );
                
                if (oldChannelData) {
                    const [oldOwnerId, oldChannelInfo] = oldChannelData;
                    const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
                    
                    if (oldChannel && oldChannel.members.size === 0) {
                        delete guildData.createdChannels[oldOwnerId];
                        fs.writeFileSync(path, JSON.stringify(data, null, 2));
                        
                        await oldChannel.delete('Voice channel kosong - dihapus otomatis');

                        const textChannel = oldState.guild.channels.cache.get(guildData.textChannelId);
                        if (textChannel) {
                            const embed = {
                                color: 0xff9900,
                                title: '🗑️ Voice Channel Dihapus Otomatis',
                                description: `Voice channel **${oldChannel.name}** dihapus karena kosong.`,
                                footer: {
                                    text: 'Voice System - anos6501',
                                    icon_url: client.user.displayAvatarURL()
                                },
                                timestamp: new Date()
                            };
                            
                            textChannel.send({ embeds: [embed] });
                        }
                    }
                }

                if (newState.channelId) {
                    const newChannel = newState.guild.channels.cache.get(newState.channelId);
                    if (newChannel && newChannel.parentId === guildData.categoryId && newChannel.id !== guildData.voiceChannelId) {
                        const newChannelData = Object.values(guildData.createdChannels).find(ch => 
                            ch.channelId === newChannel.id
                        );
                        
                        if (newChannelData) {
                            if (!newChannel.members.get(newChannelData.ownerId)) {
                                const newOwner = newChannel.members.first();
                                if (newOwner) {
                                    delete guildData.createdChannels[newChannelData.ownerId];
                                    guildData.createdChannels[newOwner.id] = {
                                        channelId: newChannel.id,
                                        ownerId: newOwner.id,
                                        createdAt: newChannelData.createdAt,
                                        bannedUsers: newChannelData.bannedUsers || []
                                    };
                                    
                                    fs.writeFileSync(path, JSON.stringify(data, null, 2));
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Voice move error:', error);
            }
        }
    }
};