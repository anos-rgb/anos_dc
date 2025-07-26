const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'stocks',
    description: 'Invest di saham untuk profit atau loss',
    aliases: ['saham', 'invest'],
    cooldown: 45,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const investment = parseInt(args[0]);
        if (!investment || investment < 500) {
            return message.reply('Minimal invest 500 koin! Contoh: `!stocks 1000`');
        }
        
        if (userData.saldo < investment) {
            return message.reply('Saldo lo ga cukup buat invest segitu!');
        }
        
        const companies = [
            { name: 'TechCorp', emoji: '💻', volatility: 0.3 },
            { name: 'GreenEnergy', emoji: '🌱', volatility: 0.4 },
            { name: 'CryptoTech', emoji: '⚡', volatility: 0.6 },
            { name: 'FoodChain', emoji: '🍔', volatility: 0.2 },
            { name: 'GameStudio', emoji: '🎮', volatility: 0.5 },
            { name: 'Anosdev', emoji: '🚀', volatility: 0.7 }
        ];
        
        const company = companies[Math.floor(Math.random() * companies.length)];
        
        const marketDirection = Math.random() - 0.5;
        const volatilityFactor = (Math.random() - 0.5) * company.volatility;
        const totalChange = marketDirection + volatilityFactor;
        
        const changePercent = Math.max(-0.5, Math.min(0.8, totalChange));
        const profit = Math.floor(investment * changePercent);
        
        userData.saldo += profit;
        userData.statistik.command_digunakan++;
        
        if (profit > 0) {
            client.database.statistik_game.penghasilan_harian += profit;
            client.database.statistik_game.total_kemenangan++;
        }
        
        client.db.save(client.database);
        
        const isProfit = profit > 0;
        const percentChange = (changePercent * 100).toFixed(1);
        
        const embed = new EmbedBuilder()
            .setColor(isProfit ? '#2ECC71' : '#E74C3C')
            .setTitle('📈 Hasil Investasi')
            .setDescription(`Investment lo di ${company.emoji} ${company.name}`)
            .addFields(
                { name: 'Perusahaan', value: `${company.emoji} ${company.name}`, inline: true },
                { name: 'Invested', value: `${investment} koin`, inline: true },
                { name: 'Perubahan', value: `${percentChange}%`, inline: true },
                { name: 'Profit/Loss', value: `${profit >= 0 ? '+' : ''}${profit} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: isProfit ? '📈 Stonks!' : '📉 Not stonks...' });
            
        message.reply({ embeds: [embed] });
    }
};