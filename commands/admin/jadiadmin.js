const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'jadiadmin',
    description: 'jadi admin magang (biaya 1.000.000 koin)',
    aliases: ['applyadmin'],
    cooldown: 30,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        // Cek apakah udah admin menggunakan ID role yang benar
        const adminRoleId = '1357321080779309186';
        if (message.member.roles.cache.has(adminRoleId)) {
            return message.reply('Lo udah jadi Admin Magang!');
        }
        
        // Cek apakah user data ada
        if (!userData) {
            return message.reply('Data lo belum terdaftar di database!');
        }
        
        // Cek saldo cukup
        if (userData.saldo < 1000000) {
            return message.reply(`Saldo lo cuma ${userData.saldo.toLocaleString()} koin, butuh 1.000.000 koin buat Jadi Admin Magang!`);
        }
        
        // Konfirmasi
        const confirmEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('👑 Jadi Admin Magang')
            .setDescription('Yakin mau jadi Admin Magang? Biaya: 1.000.000 koin')
            .addFields(
                { name: 'Persyaratan', value: '- Minimal level 10\n- Aktif minimal 5 jam/hari\n- Paham rules server', inline: false },
                { name: 'Benefit', value: '- Role khusus\n- Akses channel admin\n- Command khusus', inline: false },
                { name: 'Konfirmasi', value: 'Ketik `y` untuk lanjut atau `n` untuk batal', inline: false }
            );
            
        message.reply({ embeds: [confirmEmbed] })
            .then(confirmMsg => {
                // Bikin collector untuk konfirmasi
                const filter = m => m.author.id === message.author.id && 
                                    (m.content.toLowerCase() === 'y' || m.content.toLowerCase() === 'n');
                const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });
                
                collector.on('collect', response => {
                    if (response.content.toLowerCase() === 'y') {
                        // Cek role ada
                        const adminRole = message.guild.roles.cache.get(adminRoleId);
                        
                        if (adminRole) {
                            message.member.roles.add(adminRole)
                                .then(() => {
                                    // Proses pembayaran setelah role berhasil ditambahkan
                                    userData.saldo -= 1000000;
                                    
                                    // Simpan database
                                    if (client.db && client.db.save) {
                                        client.db.save(client.database);
                                    }
                                    
                                    // Kirim konfirmasi
                                    const successEmbed = new EmbedBuilder()
                                        .setColor('#55FF55')
                                        .setTitle('✅ Jadi Admin Berhasil!')
                                        .setDescription(`Selamat ${message.author}! Lo sekarang jadi Admin Magang!`)
                                        .addFields(
                                            { name: 'Saldo Sekarang', value: `${userData.saldo.toLocaleString()} koin`, inline: true },
                                            { name: 'Role', value: '<@&1357321080779309186>', inline: true }
                                        )
                                        .setTimestamp();
                                        
                                    response.reply({ embeds: [successEmbed] });
                                })
                                .catch(error => {
                                    console.error('Error adding role:', error);
                                    response.reply('❌ Gagal nambahin role. Pastikan bot punya permission yang cukup atau kontak owner server.');
                                });
                        } else {
                            response.reply('❌ Role Admin Magang ga ketemu. Kontak owner server untuk setup role dengan ID yang benar.');
                        }
                    } else {
                        // Batal daftar
                        const cancelEmbed = new EmbedBuilder()
                            .setColor('#FF5555')
                            .setTitle('❌ Jadi Admin Dibatalkan')
                            .setDescription('Pendaftaran Admin Magang dibatalkan.');
                            
                        response.reply({ embeds: [cancelEmbed] });
                    }
                });
                
                collector.on('end', collected => {
                    if (collected.size === 0) {
                        // Waktu habis
                        const timeoutEmbed = new EmbedBuilder()
                            .setColor('#FF5555')
                            .setTitle('⏰ Waktu Habis!')
                            .setDescription('Pendaftaran Admin Magang dibatalkan karena waktu habis (30 detik).');
                            
                        confirmMsg.reply({ embeds: [timeoutEmbed] });
                    }
                });
            })
            .catch(error => {
                console.error('Error sending confirmation message:', error);
                message.reply('❌ Terjadi error saat mengirim pesan konfirmasi.');
            });
    }
};