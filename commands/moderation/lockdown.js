const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'lockdown',
    description: 'Lockdown channel atau server',
    usage: '!lockdown <channel/server/unlock> [#channel]',

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!lockdown <channel/server/unlock> [#channel]`');
        }

        const subcommand = args[0].toLowerCase();
        let targetChannel = message.channel;

        if (args[1]) {
            const channelMention = args[1];
            const channelId = channelMention.replace(/[<#>]/g, '');
            const channel = message.guild.channels.cache.get(channelId);
            
            if (channel) {
                targetChannel = channel;
            }
        }

        if (subcommand === 'channel') {
            try {
                await targetChannel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: false,
                    AddReactions: false,
                    CreatePublicThreads: false,
                    CreatePrivateThreads: false
                });

                const embed = {
                    title: '🔒 Channel Lockdown',
                    description: `Channel ${targetChannel} telah dikunci!`,
                    color: 0xff9900,
                    footer: { text: 'anos6501' },
                    timestamp: new Date()
                };

                await message.reply({ embeds: [embed] });
            } catch (error) {
                await message.reply({ content: '❌ Gagal melakukan lockdown channel!' });
            }
        }

        else if (subcommand === 'server') {
            try {
                const channels = message.guild.channels.cache.filter(c => c.type === 0);
                
                for (const [, channel] of channels) {
                    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                        SendMessages: false,
                        AddReactions: false,
                        CreatePublicThreads: false,
                        CreatePrivateThreads: false
                    });
                }

                const embed = {
                    title: '🔒 Server Lockdown',
                    description: 'Seluruh server telah dikunci!',
                    color: 0xff0000,
                    footer: { text: 'anos6501' },
                    timestamp: new Date()
                };

                await message.reply({ embeds: [embed] });
            } catch (error) {
                await message.reply({ content: '❌ Gagal melakukan lockdown server!' });
            }
        }

        else if (subcommand === 'unlock') {
            try {
                await targetChannel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: null,
                    AddReactions: null,
                    CreatePublicThreads: null,
                    CreatePrivateThreads: null
                });

                const embed = {
                    title: '🔓 Channel Unlocked',
                    description: `Channel ${targetChannel} telah dibuka kembali!`,
                    color: 0x00ff00,
                    footer: { text: 'anos6501' },
                    timestamp: new Date()
                };

                await message.reply({ embeds: [embed] });
            } catch (error) {
                await message.reply({ content: '❌ Gagal membuka lockdown!' });
            }
        }

        else {
            return message.reply('Subcommand tidak valid! Gunakan: `!lockdown <channel/server/unlock> [#channel]`');
        }
    },
};