const { PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'randomrole',
    description: 'Membuat pilihan random role',
    usage: '!randomrole <teks> <@role1> <@role2> [@role3] [@role4] [@role5]',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 3) {
            return message.reply('Usage: `!randomrole <teks> <@role1> <@role2> [@role3] [@role4] [@role5]`');
        }

        try {
            const teks = args[0];
            const roleArgs = args.slice(1);
            const roles = [];

            for (const roleArg of roleArgs) {
                const roleId = roleArg.replace(/[<@&>]/g, '');
                try {
                    const role = await message.guild.roles.fetch(roleId);
                    if (role) {
                        roles.push({
                            id: role.id,
                            name: role.name,
                            color: role.color
                        });
                    }
                } catch (error) {
                    continue;
                }
            }

            if (roles.length < 2) {
                return message.reply('❌ Minimal 2 role diperlukan untuk random role!');
            }

            if (roles.length > 5) {
                return message.reply('❌ Maksimal 5 role yang dapat digunakan!');
            }

            const guildData = client.loadGuildData(message.guild.id);
            
            if (!guildData.randomRoleMenus) {
                guildData.randomRoleMenus = [];
            }

            const menuId = `random_${Date.now()}`;
            guildData.randomRoleMenus.push({
                id: menuId,
                text: teks,
                roles: roles,
                createdAt: new Date().toISOString()
            });

            guildData.randomRoles = roles.map(role => role.id);

            client.saveGuildData(message.guild.id, guildData);

            const embed = {
                title: '🎲 Random Role Menu',
                description: teks,
                color: 0x7289da,
                fields: [
                    {
                        name: '📋 Roles Tersedia',
                        value: roles.map(role => `• <@&${role.id}>`).join('\n'),
                        inline: false
                    }
                ],
                footer: {
                    text: 'Pilih "🎲 Random Role" untuk mendapatkan role secara acak atau pilih role spesifik!'
                },
                timestamp: new Date()
            };

            const selectMenuOptions = [
                {
                    label: '🎲 Random Role',
                    value: 'get_random',
                    description: 'Dapatkan role secara acak dari daftar!',
                    emoji: '🎲'
                }
            ];

            roles.forEach(role => {
                selectMenuOptions.push({
                    label: role.name,
                    value: role.id,
                    description: `Toggle role ${role.name}`,
                    emoji: '🎭'
                });
            });

            if (selectMenuOptions.length > 25) {
                return message.reply('❌ Terlalu banyak role! Maksimal 24 role (termasuk opsi random).');
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('random_role_select')
                .setPlaceholder('Pilih role atau dapatkan secara acak...')
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(selectMenuOptions);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await message.reply({
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.error('Error in randomrole command:', error);
            await message.reply('❌ Terjadi error saat membuat random role menu!');
        }
    }
};