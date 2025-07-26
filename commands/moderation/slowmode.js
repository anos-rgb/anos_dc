const { PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'slowmode',
    description: 'Atur slowmode channel',
    usage: '!slowmode <durasi_detik> [#channel] [alasan]',
    permissions: [PermissionFlagsBits.ManageChannels],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!slowmode <durasi_detik> [#channel] [alasan]`');
        }

        const durasi = parseInt(args[0]);
        
        if (isNaN(durasi) || durasi < 0 || durasi > 21600) {
            return message.reply('❌ Durasi harus berupa angka antara 0-21600 detik!');
        }

        let targetChannel = message.channel;
        let alasan = 'Tidak ada alasan';

        if (args.length > 1) {
            const channelMention = args[1];
            if (channelMention.startsWith('<#') && channelMention.endsWith('>')) {
                const channelId = channelMention.slice(2, -1);
                const channel = message.guild.channels.cache.get(channelId);
                
                if (channel && channel.type === ChannelType.GuildText) {
                    targetChannel = channel;
                    alasan = args.slice(2).join(' ') || 'Tidak ada alasan';
                } else {
                    return message.reply('❌ Channel tidak ditemukan atau bukan text channel!');
                }
            } else {
                alasan = args.slice(1).join(' ');
            }
        }

        try {
            await targetChannel.setRateLimitPerUser(durasi);

            const embed = new EmbedBuilder()
                .setColor(durasi > 0 ? 0xFFFF00 : 0x00FF00)
                .setTitle(durasi > 0 ? 'Slowmode Diaktifkan' : 'Slowmode Dimatikan')
                .addFields(
                    { name: 'Channel', value: targetChannel.toString(), inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Durasi', value: durasi > 0 ? `${durasi} detik` : 'Tidak ada', inline: true },
                    { name: 'Alasan', value: alasan, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('❌ Terjadi error saat mengatur slowmode!');
        }
    },
};