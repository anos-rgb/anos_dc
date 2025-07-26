const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'unlock',
    description: 'Buka kunci channel',
    usage: '!unlock [#channel] [alasan]',

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('Kamu tidak memiliki izin untuk menggunakan command ini!');
        }

        let targetChannel = message.channel;
        let alasan = 'Tidak ada alasan';

        if (args.length > 0) {
            const channelMention = args[0];
            if (channelMention.startsWith('<#') && channelMention.endsWith('>')) {
                const channelId = channelMention.slice(2, -1);
                const channel = message.guild.channels.cache.get(channelId);
                if (channel && channel.type === ChannelType.GuildText) {
                    targetChannel = channel;
                    alasan = args.slice(1).join(' ') || 'Tidak ada alasan';
                } else {
                    alasan = args.join(' ');
                }
            } else {
                alasan = args.join(' ');
            }
        }

        try {
            const everyone = message.guild.roles.everyone;
            
            await targetChannel.permissionOverwrites.edit(everyone, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Channel Telah Dibuka')
                .addFields(
                    { name: 'Channel', value: targetChannel.toString(), inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Alasan', value: alasan, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat membuka kunci channel!');
        }
    },
};