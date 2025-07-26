const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'reqfitur',
    description: 'Request fitur baru untuk bot (Admin Only)',
    usage: '!reqfitur <request_fitur>',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Akses Ditolak')
                .setDescription('Command ini hanya bisa digunakan oleh Admin server!')
                .setFooter({ text: 'anos6501' });
            
            return message.reply({ embeds: [noPermEmbed] });
        }

        if (args.length === 0) {
            return message.reply('Usage: `!reqfitur <request_fitur>`');
        }

        const request = args.join(' ');
        
        if (request.length > 500) {
            return message.reply('❌ Request terlalu panjang! Maksimal 500 karakter.');
        }

        const userId = message.author.id;
        const username = message.author.username;
        const guildName = message.guild.name;
        const guildId = message.guild.id;

        const ownerUserId = '1246506845942579311';

        try {
            const owner = await message.client.users.fetch(ownerUserId);
            
            const requestEmbed = new EmbedBuilder()
                .setColor('#00BFFF')
                .setTitle('📝 REQUEST FITUR BARU')
                .addFields(
                    { name: '👤 Dari User', value: `${username} (${userId})`, inline: true },
                    { name: '🏠 Server', value: `${guildName} (${guildId})`, inline: true },
                    { name: '⏰ Waktu', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '💭 Request Fitur', value: `\`\`\`${request}\`\`\`` }
                )
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: 'anos6501' });

            await owner.send({ embeds: [requestEmbed] });

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Request Berhasil Dikirim')
                .setDescription(`Request fiturmu sudah dikirim ke developer!\n\n**Request:** ${request}`)
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error sending feature request:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Gagal Mengirim Request')
                .setDescription('Terjadi kesalahan saat mengirim request. Coba lagi nanti.')
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [errorEmbed] });
        }
    },
};