const { PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'channel',
    description: 'Kelola channel server',
    usage: '!channel <buat/hapus/salin/edit> [arguments]',
    permissions: [PermissionFlagsBits.ManageChannels],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!channel <buat/hapus/salin/edit> [arguments]`\n\n' +
                '**Subcommands:**\n' +
                '`!channel buat <nama> <text/voice/category> [kategori_id]`\n' +
                '`!channel hapus <channel_id>`\n' +
                '`!channel salin <channel_id> [nama_baru]`\n' +
                '`!channel edit <channel_id> [nama_baru] [topik_baru]`');
        }

        const subcommand = args[0].toLowerCase();

        if (subcommand === 'buat') {
            if (args.length < 3) {
                return message.reply('Usage: `!channel buat <nama> <text/voice/category> [kategori_id]`');
            }

            const name = args[1];
            const type = args[2].toLowerCase();
            const categoryId = args[3];

            let channelType;
            switch (type) {
                case 'text':
                    channelType = ChannelType.GuildText;
                    break;
                case 'voice':
                    channelType = ChannelType.GuildVoice;
                    break;
                case 'category':
                    channelType = ChannelType.GuildCategory;
                    break;
                default:
                    return message.reply('❌ Tipe channel harus: text, voice, atau category');
            }

            try {
                const options = {
                    name: name,
                    type: channelType
                };

                if (categoryId && type !== 'category') {
                    const category = message.guild.channels.cache.get(categoryId);
                    if (category && category.type === ChannelType.GuildCategory) {
                        options.parent = category;
                    }
                }

                const newChannel = await message.guild.channels.create(options);

                const embed = {
                    title: '✅ Channel Berhasil Dibuat',
                    color: 0x00ff00,
                    fields: [
                        {
                            name: 'Nama Channel',
                            value: newChannel.name,
                            inline: true
                        },
                        {
                            name: 'Tipe',
                            value: type.charAt(0).toUpperCase() + type.slice(1),
                            inline: true
                        },
                        {
                            name: 'ID',
                            value: newChannel.id,
                            inline: true
                        }
                    ],
                    footer: { text: 'anos6501' },
                    timestamp: new Date()
                };

                await message.reply({ embeds: [embed] });

            } catch (error) {
                await message.reply('❌ Gagal membuat channel! Pastikan nama channel valid.');
            }
        }

        else if (subcommand === 'hapus') {
            if (args.length < 2) {
                return message.reply('Usage: `!channel hapus <channel_id>`');
            }

            const channelId = args[1];
            const targetChannel = message.guild.channels.cache.get(channelId);

            if (!targetChannel) {
                return message.reply('❌ Channel tidak ditemukan!');
            }

            try {
                const channelName = targetChannel.name;
                await targetChannel.delete();

                const embed = {
                    title: '🗑️ Channel Berhasil Dihapus',
                    description: `Channel **${channelName}** telah dihapus.`,
                    color: 0xff0000,
                    footer: { text: 'anos6501' },
                    timestamp: new Date()
                };

                await message.reply({ embeds: [embed] });

            } catch (error) {
                await message.reply('❌ Gagal menghapus channel!');
            }
        }

        else if (subcommand === 'salin') {
            if (args.length < 2) {
                return message.reply('Usage: `!channel salin <channel_id> [nama_baru]`');
            }

            const channelId = args[1];
            const newName = args.slice(2).join(' ');
            const targetChannel = message.guild.channels.cache.get(channelId);

            if (!targetChannel) {
                return message.reply('❌ Channel tidak ditemukan!');
            }

            try {
                const clonedChannel = await targetChannel.clone({
                    name: newName || `copy-${targetChannel.name}`,
                    reason: `Channel disalin oleh ${message.author.tag}`
                });

                const embed = {
                    title: '📋 Channel Berhasil Disalin',
                    color: 0x0099ff,
                    fields: [
                        {
                            name: 'Channel Asli',
                            value: targetChannel.name,
                            inline: true
                        },
                        {
                            name: 'Channel Baru',
                            value: clonedChannel.name,
                            inline: true
                        },
                        {
                            name: 'ID Baru',
                            value: clonedChannel.id,
                            inline: true
                        }
                    ],
                    footer: { text: 'anos6501' },
                    timestamp: new Date()
                };

                await message.reply({ embeds: [embed] });

            } catch (error) {
                await message.reply('❌ Gagal menyalin channel!');
            }
        }

        else if (subcommand === 'edit') {
            if (args.length < 3) {
                return message.reply('Usage: `!channel edit <channel_id> [nama_baru] [topik_baru]`');
            }

            const channelId = args[1];
            const targetChannel = message.guild.channels.cache.get(channelId);

            if (!targetChannel) {
                return message.reply('❌ Channel tidak ditemukan!');
            }

            const restArgs = args.slice(2);
            let newName = null;
            let newTopic = null;

            if (restArgs.length >= 1) {
                newName = restArgs[0];
            }
            if (restArgs.length >= 2) {
                newTopic = restArgs.slice(1).join(' ');
            }

            if (!newName && !newTopic) {
                return message.reply('❌ Berikan minimal satu perubahan (nama atau topik)!');
            }

            try {
                const updates = {};
                if (newName) updates.name = newName;
                if (newTopic && targetChannel.type === ChannelType.GuildText) updates.topic = newTopic;

                await targetChannel.edit(updates);

                const embed = {
                    title: '✏️ Channel Berhasil Diedit',
                    color: 0xff9900,
                    fields: [],
                    footer: { text: 'anos6501' },
                    timestamp: new Date()
                };

                if (newName) {
                    embed.fields.push({
                        name: 'Nama Baru',
                        value: newName,
                        inline: true
                    });
                }

                if (newTopic) {
                    embed.fields.push({
                        name: 'Topik Baru',
                        value: newTopic,
                        inline: false
                    });
                }

                await message.reply({ embeds: [embed] });

            } catch (error) {
                await message.reply('❌ Gagal mengedit channel!');
            }
        }

        else {
            return message.reply('❌ Subcommand tidak valid! Gunakan: buat, hapus, salin, atau edit');
        }
    },
};