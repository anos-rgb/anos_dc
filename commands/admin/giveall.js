const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'giveall',
    description: 'Admin only: Berikan saldo ke semua user yang terdaftar',
    aliases: ['giveallmoney', 'massadd'],
    adminOnly: true,
    execute(message, args, client) {
        const ADMIN_ROLE_ID = '1368506120246919218';
        
        if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
            return message.reply('❌ Command ini cuma buat admin!');
        }
        
        if (!args[0]) {
            return message.reply('Format salah! Contoh: `!giveall 1000`');
        }
        
        const amount = parseInt(args[0]);
        
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Jumlah harus berupa angka positif!');
        }
        
        const registeredUsers = Object.keys(client.database.users);
        
        if (registeredUsers.length === 0) {
            return message.reply('Tidak ada user yang terdaftar di sistem ekonomi!');
        }
        
        let successCount = 0;
        
        registeredUsers.forEach(userId => {
            client.database.users[userId].saldo += amount;
            successCount++;
        });
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#55FF55')
            .setTitle('💸 Give All Berhasil!')
            .setDescription(`Admin ${message.author.username} kasih saldo ke semua user!`)
            .addFields(
                { name: 'Jumlah Per User', value: `${amount} koin`, inline: true },
                { name: 'Total User', value: `${successCount} user`, inline: true },
                { name: 'Total Dibagikan', value: `${amount * successCount} koin`, inline: true }
            )
            .setFooter({ text: 'Admin Command - Mass Distribution' });
            
        message.reply({ embeds: [embed] });
        
        registeredUsers.forEach(async userId => {
            try {
                const user = await client.users.fetch(userId);
                const dmEmbed = new EmbedBuilder()
                    .setColor('#55FF55')
                    .setTitle('🎉 Bonus Saldo!')
                    .setDescription(`Admin ${message.author.username} kasih bonus ke semua user!`)
                    .addFields(
                        { name: 'Bonus', value: `${amount} koin`, inline: true },
                        { name: 'Saldo Sekarang', value: `${client.database.users[userId].saldo} koin`, inline: true }
                    );
                    
                user.send({ embeds: [dmEmbed] }).catch(() => {});
            } catch (error) {
                
            }
        });
    }
};