const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'cnrequests',
    description: 'Lihat semua permintaan ganti nama',
    usage: '!cnrequests [status]',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        const statusFilter = args[0] ? args[0].toLowerCase() : null;
        const validStatuses = ['pending', 'accepted', 'rejected', 'timeout'];
        
        if (statusFilter && !validStatuses.includes(statusFilter)) {
            return message.reply('❌ Status tidak valid! Gunakan: `pending`, `accepted`, `rejected`, atau `timeout`');
        }

        const guildData = client.loadGuildData(message.guild.id);

        if (!guildData.nameRequests || Object.keys(guildData.nameRequests).length === 0) {
            return message.reply('📝 Tidak ada permintaan ganti nama.');
        }

        let requests = Object.entries(guildData.nameRequests);
        
        if (statusFilter) {
            requests = requests.filter(([, request]) => request.status === statusFilter);
        }

        if (requests.length === 0) {
            return message.reply(`📝 Tidak ada permintaan dengan status **${statusFilter}**.`);
        }

        const embed = {
            title: '📝 Daftar Permintaan Ganti Nama',
            color: 0x7289da,
            fields: [],
            footer: {
                text: `Total: ${requests.length} permintaan`
            }
        };

        requests.slice(0, 10).forEach(([requestId, request]) => {
            const statusEmoji = {
                pending: '⏳',
                accepted: '✅',
                rejected: '❌',
                timeout: '⏰'
            };

            const timestamp = new Date(request.timestamp).toLocaleString('id-ID');
            
            embed.fields.push({
                name: `${statusEmoji[request.status]} ${request.status.toUpperCase()}`,
                value: `**User:** <@${request.userId}>\n**Dari:** ${request.currentName}\n**Ke:** ${request.requestedName}\n**Waktu:** ${timestamp}\n**ID:** \`${requestId}\``,
                inline: false
            });
        });

        if (requests.length > 10) {
            embed.description = `*Menampilkan 10 dari ${requests.length} permintaan*`;
        }

        await message.reply({
            embeds: [embed]
        });
    }
};