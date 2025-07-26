const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'lottery',
    description: 'Sistem lotere dengan jackpot besar',
    cooldown: 30,
    execute(message, args, client) {
        if (!client.database.lottery) {
            client.database.lottery = {
                jackpot: 100000,
                participants: {},
                drawTime: Date.now() + (24 * 60 * 60 * 1000),
                lastWinners: []
            };
        }
        
        const userData = client.database.users[message.author.id];
        const lottery = client.database.lottery;
        
        if (!args[0]) {
            const timeLeft = Math.max(0, lottery.drawTime - Date.now());
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🎟️ MEGA LOTTERY SYSTEM')
                .setDescription('Beli tiket dan menangkan jackpot besar!')
                .addFields(
                    { name: '💰 Current Jackpot', value: `${lottery.jackpot.toLocaleString()} koin`, inline: true },
                    { name: '🕒 Next Draw', value: `${hoursLeft}h ${minutesLeft}m`, inline: true },
                    { name: '👥 Participants', value: Object.keys(lottery.participants).length.toString(), inline: true },
                    { name: '🎫 Harga Tiket', value: '1,000 koin per tiket', inline: true },
                    { name: '🎯 Cara Main', value: '`!lottery buy [jumlah]`\nContoh: `!lottery buy 5`', inline: true },
                    { name: '📊 Cek Tiket', value: '`!lottery check`', inline: true }
                );
            
            if (lottery.lastWinners.length > 0) {
                embed.addFields({ 
                    name: '🏆 Last Winners', 
                    value: lottery.lastWinners.slice(-3).map(w => `${w.name}: ${w.prize.toLocaleString()} koin`).join('\n')
                });
            }
            
            return message.reply({ embeds: [embed] });
        }
        
        const action = args[0].toLowerCase();
        
        if (action === 'buy') {
            const amount = parseInt(args[1]) || 1;
            const ticketPrice = 1000;
            const totalCost = amount * ticketPrice;
            
            if (amount < 1 || amount > 100) {
                return message.reply('Kamu bisa beli 1-100 tiket sekaligus!');
            }
            
            if (userData.saldo < totalCost) {
                return message.reply(`Kamu butuh ${totalCost.toLocaleString()} koin untuk beli ${amount} tiket! Saldo: ${userData.saldo.toLocaleString()} koin`);
            }
            
            if (!lottery.participants[message.author.id]) {
                lottery.participants[message.author.id] = {
                    name: message.author.username,
                    tickets: 0,
                    numbers: []
                };
            }
            
            const participant = lottery.participants[message.author.id];
            
            for (let i = 0; i < amount; i++) {
                const numbers = [];
                for (let j = 0; j < 6; j++) {
                    let num;
                    do {
                        num = Math.floor(Math.random() * 49) + 1;
                    } while (numbers.includes(num));
                    numbers.push(num);
                }
                numbers.sort((a, b) => a - b);
                participant.numbers.push(numbers);
            }
            
            participant.tickets += amount;
            userData.saldo -= totalCost;
            lottery.jackpot += Math.floor(totalCost * 0.7);
            
            userData.statistik.game_dimainkan++;
            userData.statistik.command_digunakan++;
            client.db.save(client.database);
            
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎫 Tiket Lottery Dibeli!')
                .addFields(
                    { name: 'Tiket Dibeli', value: `${amount} tiket`, inline: true },
                    { name: 'Total Biaya', value: `${totalCost.toLocaleString()} koin`, inline: true },
                    { name: 'Total Tiket Kamu', value: `${participant.tickets} tiket`, inline: true },
                    { name: 'Saldo Tersisa', value: `${userData.saldo.toLocaleString()} koin`, inline: true },
                    { name: 'Jackpot Sekarang', value: `${lottery.jackpot.toLocaleString()} koin`, inline: true }
                );
            
            const recentNumbers = participant.numbers.slice(-3).map(nums => nums.join('-')).join('\n');
            embed.addFields({ name: 'Nomor Terbaru', value: recentNumbers || 'Tidak ada' });
            
            message.reply({ embeds: [embed] });
            
        } else if (action === 'check') {
            const participant = lottery.participants[message.author.id];
            
            if (!participant || participant.tickets === 0) {
                return message.reply('Kamu belum punya tiket lottery!');
            }
            
            const embed = new EmbedBuilder()
                .setColor('#4169E1')
                .setTitle('🎫 Tiket Lottery Kamu')
                .addFields(
                    { name: 'Total Tiket', value: participant.tickets.toString(), inline: true },
                    { name: 'Peluang Menang', value: `${((participant.tickets / Math.max(1, Object.values(lottery.participants).reduce((sum, p) => sum + p.tickets, 0))) * 100).toFixed(2)}%`, inline: true }
                );
            
            const allNumbers = participant.numbers.slice(-10).map((nums, i) => 
                `Tiket ${i + 1}: ${nums.join('-')}`
            ).join('\n');
            
            embed.addFields({ name: 'Nomor Tiket (10 Terakhir)', value: allNumbers || 'Tidak ada' });
            
            message.reply({ embeds: [embed] });
            
        } else if (action === 'draw' && message.author.id === 'ADMIN_ID') {
            drawLottery(message, client);
        }
        
        if (Date.now() >= lottery.drawTime) {
            drawLottery(message, client);
        }
    }
};

function drawLottery(message, client) {
    const lottery = client.database.lottery;
    
    if (Object.keys(lottery.participants).length === 0) {
        lottery.drawTime = Date.now() + (24 * 60 * 60 * 1000);
        return;
    }
    
    const winningNumbers = [];
    for (let i = 0; i < 6; i++) {
        let num;
        do {
            num = Math.floor(Math.random() * 49) + 1;
        } while (winningNumbers.includes(num));
        winningNumbers.push(num);
    }
    winningNumbers.sort((a, b) => a - b);
    
    const winners = [];
    
    Object.entries(lottery.participants).forEach(([userId, participant]) => {
        participant.numbers.forEach((numbers, ticketIndex) => {
            const matches = numbers.filter(num => winningNumbers.includes(num)).length;
            
            if (matches >= 3) {
                let prize = 0;
                switch(matches) {
                    case 3: prize = 5000; break;
                    case 4: prize = 50000; break;
                    case 5: prize = Math.floor(lottery.jackpot * 0.1); break;
                    case 6: prize = lottery.jackpot; break;
                }
                
                winners.push({
                    userId,
                    name: participant.name,
                    matches,
                    prize,
                    numbers: numbers
                });
            }
        });
    });
    
    winners.sort((a, b) => b.matches - a.matches);
    
    let totalPaid = 0;
    winners.forEach(winner => {
        const userData = client.database.users[winner.userId];
        if (userData) {
            userData.saldo += winner.prize;
            totalPaid += winner.prize;
        }
    });
    
    lottery.lastWinners = winners.slice(0, 10);
    lottery.jackpot = Math.max(100000, lottery.jackpot - totalPaid + 50000);
    lottery.participants = {};
    lottery.drawTime = Date.now() + (24 * 60 * 60 * 1000);
    
    client.db.save(client.database);
    
    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎊 LOTTERY DRAW RESULTS! 🎊')
        .addFields(
            { name: '🎯 Winning Numbers', value: winningNumbers.join(' - '), inline: false },
            { name: '🏆 Total Winners', value: winners.length.toString(), inline: true },
            { name: '💰 Total Prizes', value: `${totalPaid.toLocaleString()} koin`, inline: true },
            { name: '🎟️ Next Jackpot', value: `${lottery.jackpot.toLocaleString()} koin`, inline: true }
        );
    
    if (winners.length > 0) {
        const winnerList = winners.slice(0, 5).map(w => 
            `${w.name}: ${w.matches} matches - ${w.prize.toLocaleString()} koin`
        ).join('\n');
        embed.addFields({ name: '🎉 Top Winners', value: winnerList });
    } else {
        embed.addFields({ name: '😢 No Winners', value: 'Jackpot rolls over to next draw!' });
    }
    
    message.channel.send({ embeds: [embed] });
}