const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'setadmin',
    description: 'Set role admin untuk approve/reject nama',
    usage: '!setadmin <@role>',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!setadmin <@role>`');
        }

        const roleMention = args[0];
        const roleId = roleMention.replace(/[<@&>]/g, '');

        let adminRole;
        try {
            adminRole = await message.guild.roles.fetch(roleId);
        } catch (error) {
            return message.reply('❌ Role tidak ditemukan!');
        }

        if (!adminRole) {
            return message.reply('❌ Role tidak ditemukan!');
        }

        const guildData = client.loadGuildData(message.guild.id);
        guildData.adminRole = adminRole.id;
        client.saveGuildData(message.guild.id, guildData);

        await message.reply(`✅ Admin role berhasil diset ke ${adminRole}!\n\nSekarang member dengan role ini bisa approve/reject permintaan ganti nama.`);
    }
};