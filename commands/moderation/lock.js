const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'lock',
    description: 'Kunci channel agar member tidak bisa mengirim pesan',
    usage: '!lock [#channel] [alasan]',

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        let targetChannel = message.channel;
        let alasan = 'Tidak ada alasan';

        if (args.length > 0) {
            const firstArg = args[0];
            if (firstArg.startsWith('<#') && firstArg.endsWith('>')) {
                const channelId = firstArg.replace(/[<#>]/g, '');
                const channel = message.guild.channels.cache.get(channelId);
                
                if (channel && channel.isTextBased()) {
                    targetChannel = channel;
                    alasan = args.slice(1).join(' ') || 'Tidak ada alasan';
                } else if (channel) {
                    return message.reply('Channel yang dipilih bukan text channel!');
                } else {
                    return message.reply('Channel tidak ditemukan!');
                }
            } else {
                alasan = args.join(' ');
            }
        }

        try {
            const everyone = message.guild.roles.everyone;
            
            await targetChannel.permissionOverwrites.edit(everyone, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Channel Telah Dikunci')
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
            await message.reply({ content: 'Terjadi error saat mengunci channel!' });
        }
    },
};