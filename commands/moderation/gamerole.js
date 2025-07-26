const { PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'gamerole',
    description: 'Buat menu pilih role game',
    usage: '!gamerole <#channel>',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (!args[0]) {
            return message.reply('❌ Harap mention channel! Contoh: `!gamerole #channel`');
        }

        const channelMention = args[0];
        const channelId = channelMention.replace(/[<#>]/g, '');
        const channel = message.guild.channels.cache.get(channelId);

        if (!channel) {
            return message.reply('❌ Channel tidak ditemukan!');
        }

        if (!channel.isTextBased()) {
            return message.reply('❌ Channel harus berupa text channel!');
        }

        const guildData = client.loadGuildData(message.guild.id);
        guildData.gameRoleChannel = channel.id;
        client.saveGuildData(message.guild.id, guildData);

        if (!guildData.gameRoles || guildData.gameRoles.length === 0) {
            return message.reply('❌ Belum ada game role! Gunakan `!addrole` untuk menambah role game.');
        }

        const embed = {
            title: '🎮 Game Roles',
            description: 'Pilih game yang kamu mainkan untuk mendapatkan role!',
            color: 0x7289da,
            footer: {
                text: 'Klik dropdown atau button untuk toggle role'
            }
        };

        const selectMenuOptions = guildData.gameRoles.slice(0, 25).map(gameRole => ({
            label: gameRole.name,
            value: gameRole.id,
            description: `Role untuk ${gameRole.name}`
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('game_role_select')
            .setPlaceholder('Pilih game...')
            .addOptions(selectMenuOptions);

        const rows = [new ActionRowBuilder().addComponents(selectMenu)];

        const buttons = [];
        guildData.gameRoles.forEach((gameRole, index) => {
            if (index < 20) {
                buttons.push(
                    new ButtonBuilder()
                        .setCustomId(`game_role_${gameRole.id}`)
                        .setLabel(gameRole.name)
                        .setStyle(ButtonStyle.Secondary)
                );
            }
        });

        for (let i = 0; i < buttons.length; i += 5) {
            const buttonRow = new ActionRowBuilder().addComponents(buttons.slice(i, i + 5));
            rows.push(buttonRow);
        }

        await channel.send({
            embeds: [embed],
            components: rows
        });

        await message.reply(`✅ Menu game role berhasil dibuat di ${channel}!`);
    }
};