const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'casino',
    description: 'Main di kasino dengan berbagai peluang menang',
    aliases: ['kasino'],
    cooldown: 5,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        const amount = parseInt(args[0]);
        
        if (!amount || amount < 100) {
            return message.reply('Minimal bet 100 koin di kasino!');
        }
        
        if (userData.saldo < amount) {
            return message.reply('Saldo lo ga cukup buat main kasino!');
        }
        
        const games = [
            { name: "Dragon Tiger", multiplier: 2, chance: 45 },
            { name: "Baccarat", multiplier: 2.5, chance: 35 },
            { name: "Sicbo", multiplier: 3, chance: 28 },
            { name: "Fish Hunter", multiplier: 4, chance: 20 },
            { name: "Jackpot Machine", multiplier: 10, chance: 8 }
        ];
        
        const game = games[Math.floor(Math.random() * games.length)];
        const isWin = Math.random() * 100 < game.chance;
        
        userData.saldo -= amount;
        
        let result, color, winAmount = 0;
        
        if (isWin) {
            winAmount = Math.floor(amount * game.multiplier);
            userData.saldo += winAmount;
            result = `MENANG! Lo dapet ${winAmount} koin dari ${game.name}!`;
            color = '#FFD700';
        } else {
            result = `KALAH! Lo kehilangan ${amount} koin di ${game.name}`;
            color = '#FF4444';
        }
        
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🎰 Kasino')
            .setDescription(result)
            .addFields(
                { name: 'Game', value: game.name, inline: true },
                { name: 'Bet', value: `${amount} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            );
            
        message.reply({ embeds: [embed] });
    }
};