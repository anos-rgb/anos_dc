const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

function runMegaSlot(userData, bet, client) {
    const symbols = ['💎', '👑', '🏆', '💰', '⭐', '🔥', '✨', '🌟'];
    const multipliers = ['1.5x', '2x', '3x', '5x']; // Multiplier lebih kecil
    
    const result = [];
    const mults = [];
    
    for (let i = 0; i < 3; i++) {
        result.push(symbols[Math.floor(Math.random() * symbols.length)]);
        if (Math.random() < 0.2) { // Peluang multiplier lebih kecil
            mults.push(multipliers[Math.floor(Math.random() * multipliers.length)]);
        } else {
            mults.push('1x');
        }
    }
    
    let winnings = 0;
    let totalMultiplier = 1;
    let bonusRounds = 0;
    
    mults.forEach(mult => {
        totalMultiplier *= parseFloat(mult);
    });
    
    const winChance = Math.random();
    let shouldWin = false;
    
    if (winChance < 0.05) { // Winrate 5%
        shouldWin = true;
        
        if (winChance < 0.01) { // Jackpot kecil (0.1%)
            result[0] = result[1] = result[2] = symbols[Math.floor(Math.random() * symbols.length)];
        } else if (winChance < 0.03) {
            const matchSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            result[0] = result[1] = matchSymbol;
        } else {
            result[0] = result[2] = symbols[Math.floor(Math.random() * symbols.length)];
        }
    }
    
    if (result[0] === result[1] && result[1] === result[2]) {
        const symbol = result[0];
        let baseWin = bet * 1.5; // Kemenangan lebih kecil
        
        switch(symbol) {
            case '💎': baseWin = bet * 20; break;
            case '👑': baseWin = bet * 15; break;
            case '🏆': baseWin = bet * 10; break;
            case '💰': baseWin = bet * 8; break;
            default: baseWin = bet * 5; break;
        }
        
        winnings = Math.floor(baseWin * totalMultiplier);
        
        if (symbol === '💎' && totalMultiplier >= 5) {
            bonusRounds = 1; // Bonus rounds lebih sedikit
        }
    } 
    else if (result.filter(r => r === '💎').length >= 2) {
        winnings = Math.floor(bet * 5 * totalMultiplier); // Hadiah lebih kecil
    } 
    else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        winnings = Math.floor(bet * 2 * totalMultiplier); // Minimal win
    }
    
    if (!shouldWin) {
        // Kehilangan 70-85% dari saldo saat ini (bukan hanya taruhan)
        const lossPercentage = 0.7 + Math.random() * 0.15; // 70-85%
        const lossAmount = Math.floor(userData.saldo * lossPercentage);
        userData.saldo -= lossAmount;
        winnings = 0;
    } else {
        userData.saldo -= bet;
        if (winnings > 0) {
            userData.saldo += winnings;
        }
    }
    
    if (bonusRounds > 0) {
        const bonusWin = Math.floor(bet * (Math.random() * 3 + 1)); // Bonus kecil
        userData.saldo += bonusWin;
        winnings += bonusWin;
    }
    
    userData.statistik.game_dimainkan++;
    userData.statistik.command_digunakan++;
    client.db.save(client.database);
    
    const actualLoss = shouldWin ? bet : Math.floor(userData.saldo * (0.7 + Math.random() * 0.15));
    return { result, mults, totalMultiplier, winnings, bonusRounds, bet, actualLoss, shouldWin };
}

function createMegaSlotResponse(gameResult, userData, userId) {
    const { result, mults, totalMultiplier, winnings, bonusRounds, bet, actualLoss, shouldWin } = gameResult;
    
    const playButton = new ButtonBuilder()
        .setCustomId(`megaslot_${bet}_${userId}`)
        .setLabel(`Mega Spin (${bet})`)
        .setStyle(ButtonStyle.Success)
        .setEmoji('💎');
        
    const maxButton = new ButtonBuilder()
        .setCustomId(`megaslot_${Math.min(userData.saldo, bet*3)}_${userId}`)
        .setLabel('Max Bet')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🚀');
        
    const row = new ActionRowBuilder().addComponents(playButton, maxButton);
    
    const embed = new EmbedBuilder()
        .setColor(winnings > 0 ? '#FFD700' : '#8B0000')
        .setTitle('💎 MEGA SLOT MACHINE 💎')
        .setDescription(`**[ ${result.join(' | ')} ]**\n**[ ${mults.join(' | ')} ]**`)
        .addFields(
            { name: 'Total Multiplier', value: `${totalMultiplier}x`, inline: true },
            { name: 'Hasil', value: shouldWin ? `MENANG! +${winnings}💰` : `Kalah -${actualLoss}💰`, inline: true },
            { name: 'Saldo', value: `${userData.saldo}💰`, inline: true }
        );
    
    if (bonusRounds > 0) {
        embed.addFields({ name: '🎊 BONUS!', value: `${bonusRounds} Bonus Spins Triggered!` });
    }
    
    if (winnings >= bet * 50) {
        embed.setFooter({ text: '🔥 MEGA WIN! 🔥' });
    }
    
    return { embeds: [embed], components: [row] };
}

module.exports = {
    name: 'megaslot',
    description: 'Mega slot dengan multiplier dan bonus',
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        const bet = parseInt(args[0]);
        
        if (!bet || isNaN(bet) || bet <= 0) {
            return message.reply('Format: `!megaslot [taruhan]` - Minimal 500 koin');
        }
        
        if (bet < 500) {
            return message.reply('Mega slot minimal taruhan 500 koin!');
        }
        
        if (userData.saldo < bet) {
            return message.reply(`Saldo kamu ${userData.saldo} koin, kurang dari ${bet} koin!`);
        }
        
        const gameResult = runMegaSlot(userData, bet, client);
        const response = createMegaSlotResponse(gameResult, userData, message.author.id);
        
        message.reply(response);
    },
    
    async handleButtonInteraction(interaction, client) {
        if (!interaction.customId.startsWith('megaslot_')) return;
        
        const [, betAmount, userId] = interaction.customId.split('_');
        const bet = parseInt(betAmount);
        
        if (interaction.user.id !== userId) {
            return interaction.reply({ 
                content: 'Kamu tidak bisa menggunakan tombol ini!', 
                ephemeral: true 
            });
        }
        
        const userData = client.database.users[userId];
        
        if (!userData) {
            return interaction.reply({ 
                content: 'Data user tidak ditemukan!', 
                ephemeral: true 
            });
        }
        
        if (userData.saldo < bet) {
            return interaction.reply({ 
                content: `Saldo kamu ${userData.saldo} koin, kurang dari ${bet} koin!`, 
                ephemeral: true 
            });
        }
        
        const gameResult = runMegaSlot(userData, bet, client);
        const response = createMegaSlotResponse(gameResult, userData, userId);
        
        await interaction.update(response);
    }
};