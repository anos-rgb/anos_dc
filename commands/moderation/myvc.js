const fs = require('fs');
const path = require('path');
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'myvc',
    description: 'Mengatur voice channel pribadi Anda',
    aliases: ['vc', 'createvc'],
    cooldown: 3,
    
    async execute(message, args) {
        const guildId = message.guild.id;
        const dataPath = path.join(__dirname, '..', '..', 'data', `${guildId}.json`);
        
        if (!fs.existsSync(dataPath)) {
            return message.reply('Sistem create voice belum di-setup! Gunakan `!setup` terlebih dahulu.');
        }

        const guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        if (!guildData.createVoice) {
            return message.reply('Sistem create voice belum di-setup! Gunakan `!setup` terlebih dahulu.');
        }

        const userId = message.author.id;
        const userChannel = guildData.createVoice.userChannels?.[userId];
        
        if (!userChannel) {
            return message.reply('Anda tidak memiliki voice channel pribadi! Masuk ke voice channel create terlebih dahulu.');
        }

        const channel = await message.guild.channels.fetch(userChannel.channelId).catch(() => null);
        if (!channel) {
            delete guildData.createVoice.userChannels[userId];
            fs.writeFileSync(dataPath, JSON.stringify(guildData, null, 2));
            return message.reply('Voice channel pribadi Anda tidak ditemukan dan telah dihapus dari database!');
        }

        const memberCount = channel.members.size;
        const userLimit = channel.userLimit || 'Unlimited';
        const isLocked = channel.permissionOverwrites.cache.some(overwrite => 
            overwrite.id === message.guild.id && overwrite.deny.has('Connect')
        );

        const embed = new EmbedBuilder()
            .setTitle('🎤 Pengaturan Voice Channel')
            .setDescription(`**Channel:** ${channel.name}\n**Members:** ${memberCount}${userLimit !== 'Unlimited' ? `/${userLimit}` : ''}\n**Status:** ${isLocked ? '🔒 Locked' : '🔓 Unlocked'}`)
            .setColor(isLocked ? '#ff6b6b' : '#51cf66')
            .setTimestamp()
            .setFooter({ text: `Owned by ${message.author.displayName}`, iconURL: message.author.displayAvatarURL() });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('voice_settings')
            .setPlaceholder('Pilih pengaturan yang ingin diubah')
            .addOptions([
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
                    description: isLocked ? 'Membuka akses channel' : 'Mengunci akses channel',
                    value: 'toggle_lock',
                    emoji: isLocked ? '🔓' : '🔒'
                },
                {
                    label: 'Kick User',
                    description: 'Mengeluarkan user dari channel',
                    value: 'kick_user',
                    emoji: '👢'
                },
                {
                    label: 'Hide/Show Channel',
                    description: 'Menyembunyikan atau menampilkan channel',
                    value: 'toggle_visibility',
                    emoji: '👁️'
                },
                {
                    label: 'Transfer Ownership',
                    description: 'Memberikan ownership ke user lain',
                    value: 'transfer_ownership',
                    emoji: '👑'
                }
            ]);

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
                    .setEmoji('🔄'),
                new ButtonBuilder()
                    .setCustomId('clone_permissions')
                    .setLabel('Clone Permissions')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋')
            );

        const row1 = new ActionRowBuilder().addComponents(selectMenu);
        const row2 = buttons;

        try {
            await message.reply({
                embeds: [embed],
                components: [row1, row2]
            });
        } catch (error) {
            console.error('Error sending voice channel settings:', error);
            await message.reply('Terjadi kesalahan saat menampilkan pengaturan voice channel.');
        }
    }
};