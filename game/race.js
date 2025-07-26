const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'race',
    description: 'Balapan mobil untuk menang koin',
    aliases: ['balap', 'racing'],
    cooldown: 15,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const bet = parseInt(args[0]);
        if (!bet || bet < 100) {
            return message.reply('Minimal bet 100 koin! Contoh: `!race 500`');
        }
        
        if (userData.saldo < bet) {
            return message.reply('Saldo lo ga cukup buat bet segitu!');
        }
        
        const cars = ['🏎️', '🚗', '🚙', '🚐', '🚕'];
        const positions = Array.from({ length: 5 }, (_, i) => i);
        
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        const playerPosition = positions[0] + 1;
        const isWin = playerPosition <= 2;
        
        const multipliers = [3, 2, 1.5, 1, 0.5];
        const multiplier = multipliers[playerPosition - 1];
        const winAmount = Math.floor(bet * multiplier) - bet;
        
        userData.saldo += winAmount;
        userData.statistik.command_digunakan++;
        
        if (isWin) {
            client.database.statistik_game.total_kemenangan++;
        }
        
        client.db.save(client.database);
        
        const raceTrack = positions.map((pos, index) => 
            `${index === 0 ? '👤' : '🤖'} ${cars[pos]} ${index + 1 === playerPosition ? '← LO' : ''}`
        ).join('\n');
        
        const embed = new EmbedBuilder()
            .setColor(isWin ? '#00FF00' : '#FF0000')
            .setTitle('🏁 Hasil Balapan!')
            .setDescription(`**Posisi Final:**\n${raceTrack}`)
            .addFields(
                { name: 'Posisi Lo', value: `#${playerPosition}`, inline: true },
                { name: 'Bet', value: `${bet} koin`, inline: true },
                { name: 'Hasil', value: `${winAmount >= 0 ? '+' : ''}${winAmount} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: isWin ? 'GG! Lo menang!' : 'Coba lagi next time!' });
            
        message.reply({ embeds: [embed] });
    }
};