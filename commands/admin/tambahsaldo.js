const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tambahsaldo',
    description: 'Admin only: Tambah saldo user',
    aliases: ['addmoney', 'topup'],
    adminOnly: true,
    execute(message, args, client) {
        // Definisikan ROLE ID admin disini
        const ADMIN_ROLE_ID = '1368506120246919218'; // Ganti dengan role ID admin Anda
        
        // Cek admin hanya berdasarkan role
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('❌ Command ini cuma buat admin!');
        }
        
        // Cek argumen
        if (!args[0] || !args[1]) {
            return message.reply('Format salah! Contoh: `!tambahsaldo @user 1000`');
        }
        
        // Get target user
        const targetUser = message.mentions.users.first();
        
        if (!targetUser) {
            return message.reply('Lo harus mention user yang mau ditambah saldonya!');
        }
        
        // Cek target terdaftar
        if (!client.database.users[targetUser.id]) {
            return message.reply(`User ${targetUser.username} belom terdaftar di sistem ekonomi!`);
        }
        
        // Check jumlah
        const amount = parseInt(args[1]);
        
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Jumlah harus berupa angka positif!');
        }
        
        // Proses tambah saldo
        client.database.users[targetUser.id].saldo += amount;
        
        // Simpan database
        client.db.save(client.database);
        
        // Kirim konfirmasi
        const embed = new EmbedBuilder()
            .setColor('#55FF55')
            .setTitle('💵 Tambah Saldo Berhasil!')
            .setDescription(`Admin ${message.author.username} nambahin saldo ${targetUser.username}`)
            .addFields(
                { name: 'Jumlah', value: `${amount} koin`, inline: true },
                { name: 'Saldo Sekarang', value: `${client.database.users[targetUser.id].saldo} koin`, inline: true }
            )
            .setFooter({ text: 'Admin Command' });
            
        message.reply({ embeds: [embed] });
        
        // DM target
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#55FF55')
                .setTitle('💰 Saldo Ditambah!')
                .setDescription(`Admin ${message.author.username} nambahin saldo lo!`)
                .addFields(
                    { name: 'Jumlah', value: `${amount} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${client.database.users[targetUser.id].saldo} koin`, inline: true }
                );
                
            targetUser.send({ embeds: [dmEmbed] }).catch(() => {});
        } catch (error) {
            // Ignore DM errors
        }
    }
};