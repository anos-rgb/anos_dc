const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'hacking',
    description: 'Coba hack sistem bank',
    aliases: ['hack', 'cyber'],
    cooldown: 1800,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (userData.saldo < 1500) {
            return message.reply('Lo butuh minimal 1500 koin untuk beli peralatan hacking!');
        }
        
        const targets = ['Bank Mandiri', 'BCA', 'BRI', 'BNI', 'CIMB Niaga'];
        const selectedTarget = targets[Math.floor(Math.random() * targets.length)];
        const hackingCost = 500;
        const successRate = 15;
        const isSuccess = Math.random() * 100 < successRate;
        
        userData.saldo -= hackingCost;
        
        if (isSuccess) {
            const stolenAmount = Math.floor(Math.random() * 3000) + 1000;
            userData.saldo += stolenAmount;
            
            const successEmbed = new EmbedBuilder()
                .setColor('#00FF41')
                .setTitle('💻 Hacking Berhasil!')
                .setDescription(`Lo berhasil hack sistem ${selectedTarget}!`)
                .addFields(
                    { name: 'Target', value: selectedTarget, inline: true },
                    { name: 'Biaya Peralatan', value: `${hackingCost} koin`, inline: true },
                    { name: 'Dana Dicuri', value: `${stolenAmount} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Welcome to the matrix!' });
                
            message.reply({ embeds: [successEmbed] });
        } else {
            const fine = Math.floor(userData.saldo * 0.3);
            userData.saldo -= fine;
            
            const failedEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🛡️ Hack Gagal!')
                .setDescription(`Firewall ${selectedTarget} terlalu kuat! Lo ketangkep cyber crime!`)
                .addFields(
                    { name: 'Target', value: selectedTarget, inline: true },
                    { name: 'Biaya Peralatan', value: `${hackingCost} koin`, inline: true },
                    { name: 'Denda Cyber Crime', value: `${fine} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Big Brother is watching!' });
                
            message.reply({ embeds: [failedEmbed] });
        }
        
        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        
        client.db.save(client.database);
    }
};