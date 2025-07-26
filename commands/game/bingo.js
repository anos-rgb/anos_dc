const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'bingo',
    description: 'Main bingo dengan berbagai pola kemenangan',
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        const bet = parseInt(args[0]);
        
        if (!bet || isNaN(bet) || bet <= 0) {
            return message.reply('Format: `!bingo [taruhan]`');
        }
        
        if (userData.saldo < bet) {
            return message.reply(`Saldo kamu ${userData.saldo} koin, kurang dari ${bet} koin!`);
        }
        
        const playerCard = generateBingoCard();
        const calledNumbers = [];
        const totalCalls = Math.floor(Math.random() * 15) + 20;
        
        for (let i = 0; i < totalCalls; i++) {
            let number;
            do {
                number = Math.floor(Math.random() * 75) + 1;
            } while (calledNumbers.includes(number));
            calledNumbers.push(number);
        }
        
        const markedCard = markCard(playerCard, calledNumbers);
        const patterns = checkPatterns(markedCard);
        
        let winnings = 0;
        let winType = '';
        
        if (patterns.blackout) {
            winnings = bet * 50;
            winType = '🎊 BLACKOUT! 🎊';
        } else if (patterns.fourCorners) {
            winnings = bet * 25;
            winType = '🔸 FOUR CORNERS! 🔸';
        } else if (patterns.fullHouse) {
            winnings = bet * 20;
            winType = '🏠 FULL HOUSE! 🏠';
        } else if (patterns.diagonals >= 2) {
            winnings = bet * 15;
            winType = '❌ DOUBLE DIAGONAL! ❌';
        } else if (patterns.diagonals === 1) {
            winnings = bet * 8;
            winType = '📐 DIAGONAL! 📐';
        } else if (patterns.lines >= 3) {
            winnings = bet * 12;
            winType = '📊 TRIPLE LINE! 📊';
        } else if (patterns.lines === 2) {
            winnings = bet * 6;
            winType = '📏 DOUBLE LINE! 📏';
        } else if (patterns.lines === 1) {
            winnings = bet * 3;
            winType = '➖ SINGLE LINE! ➖';
        }
        
        userData.saldo -= bet;
        if (winnings > 0) {
            userData.saldo += winnings;
        }
        
        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
        
        const cardDisplay = displayBingoCard(markedCard);
        
        const playButton = new ButtonBuilder()
            .setCustomId(`bingo_${bet}_${message.author.id}`)
            .setLabel(`Main Lagi (${bet})`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎱');
            
        const luckyButton = new ButtonBuilder()
            .setCustomId(`bingo_${Math.floor(bet * 1.5)}_${message.author.id}`)
            .setLabel(`Lucky Draw (${Math.floor(bet * 1.5)})`)
            .setStyle(ButtonStyle.Success)
            .setEmoji('🍀');
            
        const row = new ActionRowBuilder().addComponents(playButton, luckyButton);
        
        const embed = new EmbedBuilder()
            .setColor(winnings > 0 ? '#00FF00' : '#FF0000')
            .setTitle('🎱 B I N G O')
            .setDescription(cardDisplay)
            .addFields(
                { name: 'Numbers Called', value: `${totalCalls} numbers: ${calledNumbers.slice(-10).join(', ')}...`, inline: false },
                { name: 'Hasil', value: winnings > 0 ? `${winType}\n+${winnings} koin` : `Tidak ada pola\n-${bet} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            );
        
        if (patterns.lines > 0) {
            embed.addFields({ name: 'Pola Ditemukan', value: `Lines: ${patterns.lines}\nDiagonals: ${patterns.diagonals}`, inline: true });
        }
        
        message.reply({ embeds: [embed], components: [row] });
    }
};

function generateBingoCard() {
    const card = [];
    const ranges = [
        [1, 15],   // B
        [16, 30],  // I
        [31, 45],  // N
        [46, 60],  // G
        [61, 75]   // O
    ];
    
    for (let col = 0; col < 5; col++) {
        const column = [];
        const [min, max] = ranges[col];
        const usedNumbers = new Set();
        
        for (let row = 0; row < 5; row++) {
            if (col === 2 && row === 2) {
                column.push('FREE');
            } else {
                let number;
                do {
                    number = Math.floor(Math.random() * (max - min + 1)) + min;
                } while (usedNumbers.has(number));
                usedNumbers.add(number);
                column.push(number);
            }
        }
        card.push(column);
    }
    
    return card;
}

function markCard(card, calledNumbers) {
    const markedCard = [];
    
    for (let col = 0; col < 5; col++) {
        const column = [];
        for (let row = 0; row < 5; row++) {
            const value = card[col][row];
            if (value === 'FREE' || calledNumbers.includes(value)) {
                column.push('✅');
            } else {
                column.push(value);
            }
        }
        markedCard.push(column);
    }
    
    return markedCard;
}

function checkPatterns(card) {
    const patterns = {
        lines: 0,
        diagonals: 0,
        fourCorners: false,
        fullHouse: false,
        blackout: false
    };
    
    let totalMarked = 0;
    
    for (let row = 0; row < 5; row++) {
        let rowComplete = true;
        for (let col = 0; col < 5; col++) {
            if (card[col][row] === '✅') {
                totalMarked++;
            } else {
                rowComplete = false;
            }
        }
        if (rowComplete) patterns.lines++;
    }
    
    for (let col = 0; col < 5; col++) {
        let colComplete = true;
        for (let row = 0; row < 5; row++) {
            if (card[col][row] !== '✅') {
                colComplete = false;
                break;
            }
        }
        if (colComplete) patterns.lines++;
    }
    
    let diagonal1 = true, diagonal2 = true;
    for (let i = 0; i < 5; i++) {
        if (card[i][i] !== '✅') diagonal1 = false;
        if (card[i][4-i] !== '✅') diagonal2 = false;
    }
    if (diagonal1) patterns.diagonals++;
    if (diagonal2) patterns.diagonals++;
    
    if (card[0][0] === '✅' && card[4][0] === '✅' && card[0][4] === '✅' && card[4][4] === '✅') {
        patterns.fourCorners = true;
    }
    
    if (totalMarked === 25) {
        patterns.blackout = true;
    } else if (totalMarked >= 20) {
        patterns.fullHouse = true;
    }
    
    return patterns;
}

function displayBingoCard(card) {
    const header = '```\n  B   I   N   G   O\n';
    let display = header;
    
    for (let row = 0; row < 5; row++) {
        let line = '';
        for (let col = 0; col < 5; col++) {
            const value = card[col][row];
            if (value === '✅') {
                line += ' ✅ ';
            } else if (value === 'FREE') {
                line += 'FREE';
            } else {
                line += value.toString().padStart(3, ' ') + ' ';
            }
        }
        display += line + '\n';
    }
    
    return display + '```';
}