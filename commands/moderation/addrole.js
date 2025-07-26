module.exports = {
    name: 'addrole',
    description: 'Tambah role game baru',
    permissions: ['Administrator'],
    args: true,
    usage: '<@role> <nama-game>',

    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Anda tidak memiliki izin untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('❌ Penggunaan: `!addrole <@role> <nama-game>`');
        }

        const roleId = args[0].replace(/[<@&>]/g, '');
        const role = message.guild.roles.cache.get(roleId);
        
        if (!role) {
            return message.reply('❌ Role tidak ditemukan! Pastikan Anda mention role yang valid.');
        }

        const gameName = args.slice(1).join(' ');

        const guildData = client.loadGuildData(message.guild.id);
        
        if (!guildData.gameRoles) {
            guildData.gameRoles = [];
        }

        const existingRole = guildData.gameRoles.find(r => r.id === role.id);
        if (existingRole) {
            return message.reply(`❌ Role ${role} sudah ada dalam daftar game role!`);
        }

        guildData.gameRoles.push({
            id: role.id,
            name: gameName.toUpperCase()
        });

        client.saveGuildData(message.guild.id, guildData);

        await message.reply(`✅ Role game berhasil ditambahkan!\n**Role:** ${role}\n**Game:** ${gameName}`);
    }
};