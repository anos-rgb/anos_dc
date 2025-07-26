const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'korupsi',
    description: 'Coba korupsi dana publik',
    aliases: ['corrupt', 'embezzle'],
    cooldown: 900,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (userData.saldo < 1000) {
            return message.reply('Lo butuh minimal 1000 koin untuk mulai korupsi!');
        }
        
        const korupsiAmount = Math.floor(Math.random() * 500) + 100;
        const successRate = 25;
        const isSuccess = Math.random() * 100 < successRate;
        
        if (isSuccess) {
            const profit = korupsiAmount * 3;
            userData.saldo += profit;
            
            const successEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('💰 Korupsi Berhasil!')
                .setDescription('Lo berhasil menggelapkan dana publik!')
                .addFields(
                    { name: 'Dana Dikorupsi', value: `${korupsiAmount} koin`, inline: true },
                    { name: 'Keuntungan', value: `${profit} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Power corrupts absolutely!' });
                
            message.reply({ embeds: [successEmbed] });
        } else {
            const fine = Math.floor(userData.saldo * 0.15);
            userData.saldo -= fine;
            
            const failedEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚨 Korupsi Ketahuan!')
                .setDescription('Lo ketangkep KPK dan kena denda!')
                .addFields(
                    { name: 'Denda', value: `${fine} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Justice prevails!' });
                
            message.reply({ embeds: [failedEmbed] });
        }
        
        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        
        client.db.save(client.database);
    }
};