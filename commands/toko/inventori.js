const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'inventori',
    description: 'Liat item yang lo punya',
    aliases: ['inventory', 'inv', 'tas'],
    cooldown: 3,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (!userData.inventori || userData.inventori.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('🎒 Inventori Kosong')
                .setDescription('```\n📦 Inventori kamu masih kosong nih!\n```')
                .addFields(
                    { 
                        name: '💡 Cara Mendapatkan Item', 
                        value: '• Beli di toko dengan `!toko`\n• Dapatkan dari daily reward\n• Menangkan dari minigame', 
                        inline: false 
                    }
                )
                .setFooter({ 
                    text: `Diminta oleh ${message.author.username}`, 
                    iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                })
                .setTimestamp();
                
            return message.reply({ embeds: [emptyEmbed] });
        }
        
        const itemCounts = {};
        userData.inventori.forEach(itemId => {
            itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
        });
        
        const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
        
        let inventoryFields = [];
        let currentFieldValue = '';
        let fieldCount = 0;
        
        for (const [itemId, count] of sortedItems) {
            const item = client.database.item_toko.find(i => i.id === itemId) || {
                nama: itemId,
                deskripsi: "Item tidak diketahui",
                harga: 0
            };
            
            const itemText = `🔹 **${item.nama}** × ${count}\n   💰 ${item.harga.toLocaleString()} coins | ${item.deskripsi}\n\n`;
            
            if (currentFieldValue.length + itemText.length > 1024) {
                inventoryFields.push({
                    name: fieldCount === 0 ? '📋 Daftar Item' : '📋 Lanjutan',
                    value: currentFieldValue || 'Tidak ada item',
                    inline: false
                });
                currentFieldValue = itemText;
                fieldCount++;
            } else {
                currentFieldValue += itemText;
            }
        }
        
        if (currentFieldValue) {
            inventoryFields.push({
                name: fieldCount === 0 ? '📋 Daftar Item' : '📋 Lanjutan',
                value: currentFieldValue,
                inline: false
            });
        }
        
        const totalValue = sortedItems.reduce((sum, [itemId, count]) => {
            const item = client.database.item_toko.find(i => i.id === itemId);
            return sum + (item ? item.harga * count : 0);
        }, 0);
        
        const embed = new EmbedBuilder()
            .setColor('#8B5CF6')
            .setTitle(`🎒 Inventori ${message.author.username}`)
            .setDescription('```\n🏆 Koleksi item kamu yang keren!\n```')
            .addFields(
                { 
                    name: '📊 Statistik Inventori', 
                    value: `📦 **Total Item:** ${userData.inventori.length}\n🎯 **Jenis Unik:** ${Object.keys(itemCounts).length}\n💎 **Total Nilai:** ${totalValue.toLocaleString()} coins`, 
                    inline: false 
                },
                ...inventoryFields
            )
            .setFooter({ 
                text: `${message.author.username} • Gunakan !topup untuk menambah koin`, 
                iconURL: message.author.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
        
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
    }
};