const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'crash',
    description: 'Game crash dimana lo harus cashout sebelum crash',
    aliases: ['rocket'],
    cooldown: 5,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        const amount = parseInt(args[0]);
        
        if (!amount || amount < 50) {
            return message.reply('Minimal bet 50 koin buat main crash!');
        }
        
        if (userData.saldo < amount) {
            return message.reply('Saldo lo ga cukup!');
        }
        
        userData.saldo -= amount;
        
        const crashPoint = Math.random() * 10 + 1;
        const autoCashout = Math.random() * crashPoint;
        
        let winAmount = 0;
        let result, color;
        
        if (autoCashout < crashPoint) {
            winAmount = Math.floor(amount * autoCashout);
            userData.saldo += winAmount;
            result = `CASHOUT! Rocket sampai ${autoCashout.toFixed(2)}x sebelum crash di ${crashPoint.toFixed(2)}x`;
            color = '#00FF00';
        } else {
            result = `CRASH! Rocket crash di ${crashPoint.toFixed(2)}x sebelum lo cashout`;
            color = '#FF0000';
        }
        
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🚀 Crash Game')
            .setDescription(result)
            .addFields(
                { name: 'Bet', value: `${amount} koin`, inline: true },
                { name: 'Cashout', value: `${autoCashout.toFixed(2)}x`, inline: true },
                { name: 'Crash Point', value: `${crashPoint.toFixed(2)}x`, inline: true },
                { name: 'Menang', value: `${winAmount} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            );
            
        message.reply({ embeds: [embed] });
    }
};