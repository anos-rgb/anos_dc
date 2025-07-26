const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'beli',
    description: 'Beli item dari toko',
    aliases: ['buy', 'purchase'],
    cooldown: 5,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        // Cek argumen
        if (!args[0]) {
            return message.reply('Format salah! Contoh: `!beli admin_magang` atau `!beli fishing_rod`');
        }
        
        const itemId = args[0].toLowerCase();
        
        // Cari item di database
        const item = client.database.item_toko.find(i => i.id.toLowerCase() === itemId);
        
        if (!item) {
            return message.reply(`Item dengan ID "${itemId}" ga ada di toko.`);
        }
        
        // Cek stok
        if (item.stok === 0) {
            return message.reply(`Item "${item.nama}" udah abis stoknya.`);
        }
        
        // Cek saldo
        if (userData.saldo < item.harga) {
            return message.reply(`Saldo lo cuma ${userData.saldo} koin, ga cukup buat beli "${item.nama}" seharga ${item.harga} koin!`);
        }
        
        // Cek special case untuk admin magang
        if (item.id === 'admin_magang') {
            // Special logic untuk admin magang disini
            
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('👑 Admin Magang Application')
                .setDescription('Lo yakin mau daftar jadi Admin Magang?')
                .addFields(
                    { name: 'Persyaratan', value: 'Biaya: 1.000.000 koin\nPengalaman: Minimal level 10\nAktif: Minimal 5 jam per hari', inline: false },
                    { name: 'Benefit', value: 'Role khusus di server\nAkses ke channel khusus\nCommand admin', inline: false }
                )
                .setFooter({ text: 'Tips: Atau bisa lewat system top-up!' });
                
            return message.reply({ embeds: [embed] });
        }
        
        // Proses pembelian
        userData.saldo -= item.harga;
        userData.inventori.push(item.id);
        
        // Update statistik server
        client.database.statistik_game.total_transaksi++;
        
        // Update stok jika bukan unlimited (-1)
        if (item.stok > 0) {
            item.stok--;
        }
        
        // Tambahkan ke riwayat beli
        userData.riwayat_beli.push({
            item: item.id,
            harga: item.harga,
            tanggal: new Date().toISOString().split('T')[0]
        });
        
        // Simpan database
        client.db.save(client.database);
        
        // Kirim konfirmasi
        const embed = new EmbedBuilder()
            .setColor('#55FF55')
            .setTitle('✅ Pembelian Berhasil!')
            .setDescription(`Lo berhasil beli ${item.nama}!`)
            .addFields(
                { name: 'Harga', value: `${item.harga} koin`, inline: true },
                { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true },
                { name: 'Cara Pakai', value: 'Item otomatis aktif/tersimpan di inventori lo', inline: false }
            )
            .setFooter({ text: 'Cek inventori lo dengan !inventori' });
            
        message.reply({ embeds: [embed] });
        
        // Tambah counter command digunakan
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
    }
};