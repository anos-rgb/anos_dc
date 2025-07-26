const fs = require('fs');
const path = require('path');
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'myvc',
    description: 'Mengatur voice channel pribadi Anda',
    aliases: ['vc', 'createvc'],
    cooldown: 3,
    
    async execute(message, args) {
        if (!message.guild) {
            return message.reply('❌ Command ini hanya bisa digunakan di server!');
        }

        const guildId = message.guild.id;
        const dataPath = path.join(__dirname, '..', '..', 'data', `${guildId}.json`);
        
        if (!fs.existsSync(dataPath)) {
            return message.reply('❌ Sistem create voice belum di-setup! Gunakan `!setup` terlebih dahulu.');
        }

        let guildData;
        try {
            guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            console.error('Error parsing guild data:', error);
            return message.reply('❌ Terjadi kesalahan saat membaca data server!');
        }
        
        if (!guildData?.createVoice?.userChannels) {
            return message.reply('❌ Sistem create voice belum di-setup! Gunakan `!setup` terlebih dahulu.');
        }

        const userId = message.author.id;
        const userChannel = guildData.createVoice.userChannels[userId];
        
        if (!userChannel?.channelId) {
            return message.reply('❌ Anda tidak memiliki voice channel pribadi! Masuk ke voice channel create terlebih dahulu.');
        }

        let channel;
        try {
            channel = await message.guild.channels.fetch(userChannel.channelId);
        } catch (error) {
            delete guildData.createVoice.userChannels[userId];
            try {
                fs.writeFileSync(dataPath, JSON.stringify(guildData, null, 2));
            } catch (writeError) {
                console.error('Error updating guild data:', writeError);
            }
            return message.reply('❌ Voice channel pribadi Anda tidak ditemukan dan telah dihapus dari database!');
        }

        if (!channel || channel.type !== 2) {
            delete guildData.createVoice.userChannels[userId];
            try {
                fs.writeFileSync(dataPath, JSON.stringify(guildData, null, 2));
            } catch (writeError) {
                console.error('Error updating guild data:', writeError);
            }
            return message.reply('❌ Voice channel pribadi Anda tidak valid dan telah dihapus dari database!');
        }

        const memberCount = channel.members?.size || 0;
        const userLimit = channel.userLimit === 0 ? 'Unlimited' : channel.userLimit;
        
        const everyoneOverwrite = channel.permissionOverwrites.cache.get(message.guild.id);
        const isLocked = everyoneOverwrite?.deny?.has(PermissionFlagsBits.Connect) || false;
        
        const isHidden = everyoneOverwrite?.deny?.has(PermissionFlagsBits.ViewChannel) || false;

        const ownerInChannel = channel.members?.has(userId) || false;

        const embed = new EmbedBuilder()
            .setTitle('🎤 Pengaturan Voice Channel')
            .setDescription(
                `**Channel:** ${channel.name}\n` +
                `**Members:** ${memberCount}${userLimit !== 'Unlimited' ? `/${userLimit}` : ''}\n` +
                `**Status:** ${isLocked ? '🔒 Locked' : '🔓 Unlocked'}\n` +
                `**Visibility:** ${isHidden ? '👁️‍🗨️ Hidden' : '👁️ Visible'}\n` +
                `**Owner Status:** ${ownerInChannel ? '✅ In Channel' : '❌ Not in Channel'}`
            )
            .setColor(isLocked ? '#ff6b6b' : (isHidden ? '#ffd43b' : '#51cf66'))
            .setTimestamp()
            .setFooter({ 
                text: `Owned by ${message.author.displayName}`, 
                iconURL: message.author.displayAvatarURL({ dynamic: true, size: 256 }) 
            });

        const selectMenuOptions = [
            {
                label: 'Ubah Nama Channel',
                description: 'Mengubah nama voice channel',
                value: 'change_name',
                emoji: '📝'
            },
            {
                label: 'Atur Limit User',
                description: 'Mengatur batas maksimal user (0 = unlimited)',
                value: 'set_limit',
                emoji: '👥'
            },
            {
                label: isLocked ? 'Unlock Channel' : 'Lock Channel',
                description: isLocked ? 'Membuka akses channel untuk semua user' : 'Mengunci akses channel dari user baru',
                value: 'toggle_lock',
                emoji: isLocked ? '🔓' : '🔒'
            },
            {
                label: isHidden ? 'Show Channel' : 'Hide Channel',
                description: isHidden ? 'Menampilkan channel ke semua user' : 'Menyembunyikan channel dari user lain',
                value: 'toggle_visibility',
                emoji: isHidden ? '👁️' : '🙈'
            }
        ];

        if (memberCount > 1) {
            selectMenuOptions.push({
                label: 'Kick User',
                description: 'Mengeluarkan user dari channel',
                value: 'kick_user',
                emoji: '👢'
            });
        }

        if (ownerInChannel && memberCount > 1) {
            selectMenuOptions.push({
                label: 'Transfer Ownership',
                description: 'Memberikan ownership ke user lain di channel',
                value: 'transfer_ownership',
                emoji: '👑'
            });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('voice_settings')
            .setPlaceholder('Pilih pengaturan yang ingin diubah')
            .addOptions(selectMenuOptions);

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('delete_channel')
                    .setLabel('Hapus Channel')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️'),
                new ButtonBuilder()
                    .setCustomId('refresh_info')
                    .setLabel('Refresh Info')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔄')
            );

        if (memberCount > 0) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId('clone_permissions')
                    .setLabel('Clone Permissions')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋')
            );
        }

        const components = [new ActionRowBuilder().addComponents(selectMenu)];
        
        if (buttons.components.length > 0) {
            components.push(buttons);
        }

        try {
            const sentMessage = await message.reply({
                embeds: [embed],
                components: components
            });

            const collector = sentMessage.createMessageComponentCollector({
                filter: (interaction) => interaction.user.id === message.author.id,
                time: 300000
            });

            collector.on('end', async () => {
                try {
                    const disabledComponents = components.map(row => {
                        const newRow = ActionRowBuilder.from(row);
                        newRow.components.forEach(component => {
                            if (component.data.custom_id) {
                                component.setDisabled(true);
                            }
                        });
                        return newRow;
                    });

                    await sentMessage.edit({
                        embeds: [embed.setFooter({ text: 'Menu telah expired' })],
                        components: disabledComponents
                    }).catch(() => {});
                } catch (error) {
                    console.error('Error disabling components:', error);
                }
            });

        } catch (error) {
            console.error('Error sending voice channel settings:', error);
            return message.reply('❌ Terjadi kesalahan saat menampilkan pengaturan voice channel. Pastikan bot memiliki permission yang cukup!');
        }
    }
};
