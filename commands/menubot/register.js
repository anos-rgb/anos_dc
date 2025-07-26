const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'register',
    description: 'Daftarin diri lo ke sistem ekonomi!',
    aliases: ['regr', 'mulai'],
    cooldown: 5,
    execute(message, args, client) {
        // Cek kalo user udah terdaftar
        if (client.database.users[message.author.id]) {
            const embed = new EmbedBuilder()
                .setColor('#FF5555')
                .setTitle('❌ Udah Terdaftar!')
                .setDescription('Lo udah terdaftar! Ga usah register lagi, cek saldo lo dengan `!saldo`')
                .setFooter({ text: 'EkonomiBot Kece' });
                
            return message.reply({ embeds: [embed] });
        }
        
        // Daftarin user baru
        client.database.users[message.author.id] = {
            saldo: 1000,
            inventori: [],
            statistik: {
                game_dimainkan: 0,
                command_digunakan: 1,
                kerja_terakhir: 0
            },
            riwayat_beli: []
        };
        
        // Simpan database
        client.db.save(client.database);
        
        // Kirim konfirmasi
        const embed = new EmbedBuilder()
            .setColor('#55FF55')
            .setTitle('✅ register Berhasil!')
            .setDescription('Selamat datang di sistem ekonomi kita! Lo udah dapet 1000 koin sebagai hadiah selamat datang.')
            .addFields(
                { name: 'Saldo Awal', value: '1000 koin', inline: true },
                { name: 'Next Step', value: 'Ketik `!menu` buat liat semua perintah', inline: true }
            )
            .setFooter({ text: 'EkonomiBot Kece' });
            
        message.reply({ embeds: [embed] });
    }
};