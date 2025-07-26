const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'heisbank',
    description: 'Rampok bank untuk dapetin koin banyak',
    aliases: ['rampokbank', 'robbank'],
    cooldown: 60,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (userData.saldo < 1000) {
            return message.reply('Lo butuh minimal 1000 koin buat nyiaptin equipment heist!');
        }
        
        const targets = [
            { name: 'ATM Pinggir Jalan', emoji: '🏧', reward: 2000, risk: 0.2 },
            { name: 'Toko Kelontong', emoji: '🏪', reward: 3000, risk: 0.3 },
            { name: 'Bank Kecil', emoji: '🏦', reward: 5000, risk: 0.5 },
            { name: 'Bank Besar', emoji: '🏛️', reward: 8000, risk: 0.7 },
            { name: 'Casino', emoji: '🎰', reward: 12000, risk: 0.8 },
            { name: 'Mint Uang', emoji: '💰', reward: 20000, risk: 0.9 }
        ];
        
        const equipmentCost = 1000;
        const target = targets[Math.floor(Math.random() * targets.length)];
        
        const heistChance = Math.random();
        const isSuccessful = heistChance > target.risk;
        
        userData.saldo -= equipmentCost;
        
        if (!isSuccessful) {
            const fine = Math.floor(userData.saldo * 0.15);
            userData.saldo = Math.max(0, userData.saldo - fine);
            userData.statistik.command_digunakan++;
            
            client.db.save(client.database);
            
            const embed = new EmbedBuilder()
                .setColor('#FF4757')
                .setTitle('🚨 Heist Gagal!')
                .setDescription(`Lo ketangkep pas ngerampok ${target.emoji} ${target.name}!`)
                .addFields(
                    { name: 'Target', value: `${target.emoji} ${target.name}`, inline: true },
                    { name: 'Equipment Cost', value: `${equipmentCost} koin`, inline: true },
                    { name: 'Denda', value: `${fine} koin`, inline: true },
                    { name: 'Total Loss', value: `${equipmentCost + fine} koin`, inline: true },
                    { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Polisi udah nunggu di luar!' });
                
            return message.reply({ embeds: [embed] });
        }
        
        const skillBonus = Math.random() < 0.15 ? 1.5 : 1;
        const finalReward = Math.floor(target.reward * skillBonus);
        
        userData.saldo += finalReward;
        userData.statistik.command_digunakan++;
        client.database.statistik_game.penghasilan_harian += finalReward;
        client.database.statistik_game.total_kemenangan++;
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('💰 Heist Berhasil!')
            .setDescription(`Lo berhasil ngerampok ${target.emoji} ${target.name}!`)
            .addFields(
                { name: 'Target', value: `${target.emoji} ${target.name}`, inline: true },
                { name: 'Equipment Cost', value: `${equipmentCost} koin`, inline: true },
                { name: 'Stolen', value: `${finalReward} koin`, inline: true },
                { name: 'Net Profit', value: `${finalReward - equipmentCost} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: skillBonus > 1 ? '🥷 Master thief! Bonus loot!' : 'Mission accomplished!' });
            
        message.reply({ embeds: [embed] });
    }
};