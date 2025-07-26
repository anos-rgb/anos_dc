const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'penipuan',
    description: 'Coba tipu orang dengan skema ponzi',
    aliases: ['scam', 'fraud'],
    cooldown: 720,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (userData.saldo < 200) {
            return message.reply('Lo butuh minimal 200 koin modal untuk mulai penipuan!');
        }
        
        const investment = Math.floor(Math.random() * 300) + 50;
        const successRate = 35;
        const isSuccess = Math.random() * 100 < successRate;
        
        if (isSuccess) {
            const profit = investment * 4;
            userData.saldo += profit;
            
            const successEmbed = new EmbedBuilder()
                .setColor('#9932CC')
                .setTitle('🎭 Penipuan Berhasil!')
                .setDescription('Skema ponzi lo berhasil menipu banyak orang!')
                .addFields(
                    { name: 'Modal Awal', value: `${investment} koin`, inline: true },
                    { name: 'Keuntungan', value: `${profit} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Easy money from gullible people!' });
                
            message.reply({ embeds: [successEmbed] });
        } else {
            const loss = Math.floor(userData.saldo * 0.12);
            userData.saldo -= loss;
            
            const failedEmbed = new EmbedBuilder()
                .setColor('#8B0000')
                .setTitle('⚖️ Penipuan Terbongkar!')
                .setDescription('Korban lo lapor polisi dan lo kena tuntutan!')
                .addFields(
                    { name: 'Ganti Rugi', value: `${loss} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Karma strikes back!' });
                
            message.reply({ embeds: [failedEmbed] });
        }
        
        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        
        client.db.save(client.database);
    }
};