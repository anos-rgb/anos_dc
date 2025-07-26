const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'toko',
    description: 'Liat barang yang tersedia di toko',
    aliases: ['shop', 'store'],
    cooldown: 5,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        // Cek apakah user sudah ada di database
        if (!userData) {
            return message.reply('Lo belum terdaftar! Ketik `!register` dulu ya.');
        }
        
        // Get item dari database
        const items = client.database.item_toko;
        
        // Cek apakah ada item di toko
        if (!items || items.length === 0) {
            return message.reply('Toko saat ini kosong! Coba lagi nanti ya.');
        }
        
        // Function untuk bikin embed toko dengan semua item
        function createShopEmbed() {
            let itemsText = '';
            
            for (const item of items) {
                const stock = item.stok === -1 ? "∞" : item.stok;
                itemsText += `**${item.id}** - ${item.nama}\n`;
                itemsText += `💰 Harga: ${item.harga} koin | 📦 Stok: ${stock}\n`;
                itemsText += `📝 ${item.deskripsi}\n\n`;
            }
            
            const embed = new EmbedBuilder()
                .setColor('#FF8C00')
                .setTitle('🛒 Toko Item')
                .setDescription(itemsText || 'Toko kosong!')
                .addFields(
                    { name: 'Saldo Lo', value: `${userData.saldo} koin`, inline: true },
                    { name: 'Cara Beli', value: `\`!beli [item_id]\``, inline: true },
                    { name: 'Total Item', value: `${items.length} item tersedia`, inline: true }
                )
                .setFooter({ text: `Semua ${items.length} item ditampilkan` });
                
            return embed;
        }
        
        // Kirim embed tanpa tombol
        const embed = createShopEmbed();
        message.reply({ embeds: [embed] })
            .catch(error => {
                console.error('Error saat mengirim embed toko:', error);
                message.reply('Terjadi kesalahan saat menampilkan toko. Coba lagi nanti ya!');
            });
            
        // Tambah counter command digunakan
        try {
            userData.statistik.command_digunakan++;
            client.db.save(client.database);
        } catch (error) {
            console.error('Error saat update statistik:', error);
        }
    }
};