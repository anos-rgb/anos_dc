const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'resetuser',
    description: 'Admin only: Reset data user',
    aliases: ['reset'],
    adminOnly: true,
    execute(message, args, client) {
        // Daftar Role ID yang diizinkan (ganti dengan role ID admin Anda)
        const ALLOWED_ROLE_IDS = [
            '136850612024691918', // Role ID pertama
            '123456789012345678'  // Role ID kedua (jika ada)
        ];

        // Cek admin berdasarkan Role ID
        const isAdmin = message.member.roles.cache.some(role => 
            ALLOWED_ROLE_IDS.includes(role.id)
        );

        if (!isAdmin) {
            return message.reply('❌ Command ini hanya untuk admin!');
        }
        
        // Cek argumen
        if (!args[0]) {
            return message.reply('Format salah! Contoh: `!resetuser @user`');
        }
        
        // Get target user
        const targetUser = message.mentions.users.first();
        
        if (!targetUser) {
            return message.reply('Anda harus mention user yang mau direset!');
        }
        
        // Cek target terdaftar
        if (!client.database.users[targetUser.id]) {
            return message.reply(`User ${targetUser.username} belum terdaftar di sistem ekonomi!`);
        }
        
        // Konfirmasi reset dengan button (jika menggunakan Discord.js v13+)
        const confirmEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⚠️ Konfirmasi Reset User')
            .setDescription(`Yakin mau reset semua data ${targetUser.username}?`)
            .addFields(
                { name: 'Apa yang akan direset?', value: 'Semua saldo, inventori, dan statistik', inline: false },
                { name: 'Peringatan', value: 'Tindakan ini tidak bisa dibatalkan!', inline: false }
            );
            
        message.reply({ 
            embeds: [confirmEmbed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 3,
                            label: 'Ya, Reset',
                            custom_id: 'confirm_reset'
                        },
                        {
                            type: 2,
                            style: 4,
                            label: 'Batal',
                            custom_id: 'cancel_reset'
                        }
                    ]
                }
            ]
        }).then(confirmMsg => {
            // Filter untuk interaksi button
            const filter = i => i.user.id === message.author.id;
            const collector = confirmMsg.createMessageComponentCollector({ 
                filter, 
                time: 15000 
            });
            
            collector.on('collect', async i => {
                if (i.customId === 'confirm_reset') {
                    // Reset user
                    client.database.users[targetUser.id] = {
                        saldo: 0,
                        inventori: [],
                        statistik: {
                            game_dimainkan: 0,
                            command_digunakan: 1,
                            kerja_terakhir: 0
                        },
                        riwayat_beli: []
                    };
                    
                    // Simpan database
                    await client.db.save(client.database);
                    
                    // Update embed
                    const successEmbed = new EmbedBuilder()
                        .setColor('#55FF55')
                        .setTitle('✅ Reset Berhasil!')
                        .setDescription(`Semua data ${targetUser.username} sudah direset ke default.`)
                        .setFooter({ text: 'Admin Command' });
                        
                    await i.update({
                        embeds: [successEmbed],
                        components: []
                    });
                    
                    // DM target
                    try {
                        const dmEmbed = new EmbedBuilder()
                            .setColor('#FF5555')
                            .setTitle('⚠️ Data Anda Telah Direset!')
                            .setDescription(`Admin ${message.author.username} telah reset semua data ekonomi Anda.`)
                            .addFields(
                                { name: 'Saldo Sekarang', value: '0 koin', inline: true },
                                { name: 'Inventori', value: 'Kosong', inline: true }
                            );
                            
                        await targetUser.send({ embeds: [dmEmbed] });
                    } catch (error) {
                        console.error('Gagal mengirim DM:', error);
                    }
                } else if (i.customId === 'cancel_reset') {
                    // Batal reset
                    const cancelEmbed = new EmbedBuilder()
                        .setColor('#FF5555')
                        .setTitle('❌ Reset Dibatalkan')
                        .setDescription('Reset data user dibatalkan.')
                        .setFooter({ text: 'Admin Command' });
                        
                    await i.update({
                        embeds: [cancelEmbed],
                        components: []
                    });
                }
            });
            
            collector.on('end', collected => {
                if (collected.size === 0) {
                    // Waktu habis
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF5555')
                        .setTitle('⏰ Waktu Habis!')
                        .setDescription('Konfirmasi reset dibatalkan karena waktu habis.')
                        .setFooter({ text: 'Admin Command' });
                        
                    confirmMsg.edit({
                        embeds: [timeoutEmbed],
                        components: []
                    });
                }
            });
        });
    }
};