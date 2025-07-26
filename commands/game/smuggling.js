const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'smuggling',
    description: 'Coba selundupkan barang ilegal',
    aliases: ['selundup', 'contraband'],
    cooldown: 1200,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (userData.saldo < 800) {
            return message.reply('Lo butuh minimal 800 koin untuk beli barang selundupan!');
        }
        
        const goods = ['elektronik', 'rokok', 'alkohol', 'parfum', 'jam tangan'];
        const selectedGood = goods[Math.floor(Math.random() * goods.length)];
        const cost = Math.floor(Math.random() * 400) + 200;
        const successRate = 20;
        const isSuccess = Math.random() * 100 < successRate;
        
        if (isSuccess) {
            const profit = cost * 5;
            userData.saldo += profit;
            
            const successEmbed = new EmbedBuilder()
                .setColor('#FF8C00')
                .setTitle('📦 Smuggling Berhasil!')
                .setDescription(`Lo berhasil selundupkan ${selectedGood} lewat bea cukai!`)
                .addFields(
                    { name: 'Barang', value: selectedGood, inline: true },
                    { name: 'Modal', value: `${cost} koin`, inline: true },
                    { name: 'Keuntungan', value: `${profit} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'High risk, high reward!' });
                
            message.reply({ embeds: [successEmbed] });
        } else {
            const fine = Math.floor(userData.saldo * 0.25);
            userData.saldo -= fine;
            
            const failedEmbed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🚔 Ketangkep Bea Cukai!')
                .setDescription(`Petugas nemuin ${selectedGood} ilegal lo!`)
                .addFields(
                    { name: 'Barang Disita', value: selectedGood, inline: true },
                    { name: 'Denda', value: `${fine} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Customs always watching!' });
                
            message.reply({ embeds: [failedEmbed] });
        }
        
        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        
        client.db.save(client.database);
    }
};