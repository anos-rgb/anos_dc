const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'horserace',
    description: 'Taruhan pada pacuan kuda untuk menang koin',
    aliases: ['horse', 'pacuan', 'kuda'],
    cooldown: 8,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (!args[0] || !args[1] || isNaN(args[0]) || isNaN(args[1]) || parseInt(args[1]) < 150) {
            return message.reply('Gunakan: `horserace <nomor_kuda> <taruhan>`\nNomor kuda: 1-5, minimal taruhan: 150 koin');
        }
        
        const horseNum = parseInt(args[0]);
        const bet = parseInt(args[1]);
        
        if (horseNum < 1 || horseNum > 5) {
            return message.reply('Pilih nomor kuda 1-5!');
        }
        
        if (userData.saldo < bet) {
            return message.reply(`Saldo lo gak cukup! Lo punya ${userData.saldo} koin.`);
        }
        
        const horses = [
            { name: 'Thunder', emoji: '🐎', odds: 3.5 },
            { name: 'Lightning', emoji: '🏇', odds: 2.8 },
            { name: 'Storm', emoji: '🐴', odds: 4.2 },
            { name: 'Blaze', emoji: '🦄', odds: 5.0 },
            { name: 'Spirit', emoji: '🎠', odds: 3.0 }
        ];
        
        const selectedHorse = horses[horseNum - 1];
        const potentialWin = Math.floor(bet * selectedHorse.odds);
        
        const raceEmbed = new EmbedBuilder()
            .setColor('#8B4513')
            .setTitle('🏁 Pacuan Kuda Dimulai!')
            .setDescription('Kuda-kuda sedang bersiap di garis start...\n\n' +
                horses.map((horse, i) => `${i + 1}. ${horse.emoji} ${horse.name} (${horse.odds}x)`).join('\n'))
            .addFields(
                { name: 'Pilihan Lo', value: `Kuda #${horseNum} - ${selectedHorse.emoji} ${selectedHorse.name}`, inline: true },
                { name: 'Taruhan', value: `${bet} koin`, inline: true },
                { name: 'Potensi Hadiah', value: `${potentialWin} koin`, inline: true }
            )
            .setFooter({ text: 'Lomba akan dimulai...' });
            
        message.reply({ embeds: [raceEmbed] }).then(async (msg) => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const positions = [0, 0, 0, 0, 0];
            const finishLine = 10;
            let raceOver = false;
            let winner = -1;
            
            const raceInterval = setInterval(() => {
                for (let i = 0; i < 5; i++) {
                    positions[i] += Math.floor(Math.random() * 3) + 1;
                    if (positions[i] >= finishLine && !raceOver) {
                        raceOver = true;
                        winner = i;
                        clearInterval(raceInterval);
                        break;
                    }
                }
                
                let raceDisplay = '🏁 **PACUAN BERLANGSUNG** 🏁\n\n';
                positions.forEach((pos, i) => {
                    const track = '▬'.repeat(Math.min(pos, finishLine)) + horses[i].emoji + '▬'.repeat(Math.max(0, finishLine - pos));
                    raceDisplay += `${i + 1}. ${track} ${horses[i].name}\n`;
                });
                raceDisplay += '\n🏆 ═══════════════════ FINISH';
                
                const updateEmbed = new EmbedBuilder()
                    .setColor('#FF8C00')
                    .setTitle('🏁 Pacuan Kuda')
                    .setDescription(raceDisplay);
                    
                msg.edit({ embeds: [updateEmbed] });
                
                if (raceOver) {
                    setTimeout(() => {
                        const winnerHorse = horses[winner];
                        const isPlayerWin = (winner + 1) === horseNum;
                        
                        let resultColor = isPlayerWin ? '#00FF00' : '#FF0000';
                        let resultTitle = isPlayerWin ? '🎉 KUDA LO MENANG!' : '💸 KUDA LO KALAH!';
                        
                        if (isPlayerWin) {
                            userData.saldo += potentialWin;
                            client.database.statistik_game.koin_beredar += potentialWin;
                        } else {
                            userData.saldo -= bet;
                            client.database.statistik_game.koin_beredar -= bet;
                        }
                        
                        userData.statistik.command_digunakan++;
                        
                        const resultEmbed = new EmbedBuilder()
                            .setColor(resultColor)
                            .setTitle(resultTitle)
                            .setDescription(`**Pemenang:** ${winnerHorse.emoji} ${winnerHorse.name} (#${winner + 1})`)
                            .addFields(
                                { name: 'Pilihan Lo', value: `#${horseNum} - ${selectedHorse.emoji} ${selectedHorse.name}`, inline: true },
                                { name: isPlayerWin ? 'Hadiah' : 'Kehilangan', value: `${isPlayerWin ? '+' : '-'}${isPlayerWin ? potentialWin : bet} koin`, inline: true },
                                { name: 'Saldo Baru', value: `${userData.saldo} koin`, inline: true }
                            );
                        
                        msg.edit({ embeds: [resultEmbed] });
                        client.db.save(client.database);
                    }, 1000);
                }
            }, 2000);
            
            setTimeout(() => {
                if (!raceOver) {
                    clearInterval(raceInterval);
                    msg.edit({ content: 'Lomba terhenti karena error teknis!', embeds: [] });
                }
            }, 30000);
        });
    }
};