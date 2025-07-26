const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'role',
    description: 'Kelola role member',
    usage: '!role add <@user> <@role> [alasan] atau !role remove <@user> <@role> [alasan]',
    permissions: [PermissionFlagsBits.ManageRoles],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 3) {
            return message.reply('Usage: `!role add <@user> <@role> [alasan]` atau `!role remove <@user> <@role> [alasan]`');
        }

        const action = args[0].toLowerCase();
        const targetMention = args[1];
        const roleMention = args[2];
        const alasan = args.slice(3).join(' ') || 'Tidak ada alasan';

        if (action !== 'add' && action !== 'remove') {
            return message.reply('Action harus berupa `add` atau `remove`!');
        }

        const targetId = targetMention.replace(/[<@!>]/g, '');
        const roleId = roleMention.replace(/[<@&>]/g, '');

        let target;
        try {
            target = await message.client.users.fetch(targetId);
        } catch (error) {
            return message.reply('User tidak ditemukan!');
        }

        let role;
        try {
            role = await message.guild.roles.fetch(roleId);
        } catch (error) {
            return message.reply('Role tidak ditemukan!');
        }

        if (!role) {
            return message.reply('Role tidak ditemukan!');
        }

        if (target.id === message.client.user.id) {
            return message.reply('Kamu tidak bisa mengubah role bot!');
        }

        try {
            const member = await message.guild.members.fetch(target.id);
            const botMember = await message.guild.members.fetch(message.client.user.id);

            if (role.position >= message.member.roles.highest.position) {
                return message.reply('Kamu tidak bisa mengelola role yang sama atau lebih tinggi dari role tertinggimu!');
            }

            if (role.position >= botMember.roles.highest.position) {
                return message.reply('Bot tidak bisa mengelola role yang sama atau lebih tinggi dari role tertinggi bot!');
            }

            if (member.roles.highest.position >= message.member.roles.highest.position && target.id !== message.author.id) {
                return message.reply('Kamu tidak bisa mengelola role member yang memiliki role sama atau lebih tinggi!');
            }

            if (action === 'add') {
                if (member.roles.cache.has(role.id)) {
                    return message.reply(`${target.tag} sudah memiliki role ${role.name}!`);
                }

                await member.roles.add(role, `${alasan} - Oleh: ${message.author.tag}`);

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('Role Berhasil Ditambahkan')
                    .setThumbnail(target.displayAvatarURL())
                    .addFields(
                        { name: 'Member', value: `${target.tag} (${target.id})`, inline: true },
                        { name: 'Role', value: role.toString(), inline: true },
                        { name: 'Moderator', value: message.author.tag, inline: true },
                        { name: 'Alasan', value: alasan, inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'anos6501' });

                await message.reply({ embeds: [embed] });

            } else if (action === 'remove') {
                if (!member.roles.cache.has(role.id)) {
                    return message.reply(`${target.tag} tidak memiliki role ${role.name}!`);
                }

                await member.roles.remove(role, `${alasan} - Oleh: ${message.author.tag}`);

                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Role Berhasil Dihapus')
                    .setThumbnail(target.displayAvatarURL())
                    .addFields(
                        { name: 'Member', value: `${target.tag} (${target.id})`, inline: true },
                        { name: 'Role', value: role.toString(), inline: true },
                        { name: 'Moderator', value: message.author.tag, inline: true },
                        { name: 'Alasan', value: alasan, inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'anos6501' });

                await message.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat mengelola role!');
        }
    },
};