const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'progressive',
    description: 'Progressive jackpot slot dengan jackpot yang terus bertambah',
    cooldown: 15,
    execute(message, args, client) {
        if (!client.database.progressive) {
            client.database.progressive = {
                jackpot: 10000,
                lastWinner: null,
                totalPlayers: 0
            };
        }
        
        const userData = client.database.users[message.author.id];
        const bet = parseInt(args[0]);
        
        if (!bet || isNaN(bet) || bet <= 0) {
            return message.reply('Format: `!progressive [taruhan]` - Minimal 1000 koin');
        }
        
        if (bet < 1000) {
            return message.reply('Progressive slot minimal taruhan 1000 koin!');
        }
        
        if (userData.saldo < bet) {
            return message.reply(`Saldo kamu ${userData.saldo} koin, kurang dari ${bet} koin!`);
        }
        
        const progressive = client.database.progressive;
        progressive.jackpot += Math.floor(bet * 0.1);
        progressive.totalPlayers++;
        
        const symbols = ['🔥', '⚡', '💫', '🌟', '✨', '💎', '👑', '🏆'];
        const jackpotSymbol = '🏆';
        
        const result = [];
        for (let i = 0; i < 5; i++) {
            if (Math.random() < 0.02) {
                result.push(jackpotSymbol);
            } else {
                result.push(symbols[Math.floor(Math.random() * symbols.length)]);
            }
        }
        
        let winnings = 0;
        let winType = '';
        let jackpotWon = false;
        
        const jackpotCount = result.filter(s => s === jackpotSymbol).length;
        
        if (jackpotCount === 5) {
            winnings = progressive.jackpot;
            progressive.lastWinner = message.author.username;
            progressive.jackpot = 10000;
            jackpotWon = true;
            winType = '🏆 PROGRESSIVE JACKPOT! 🏆';
        } else if (jackpotCount === 4) {
            winnings = bet * 100;
            winType = '🎊 MINI JACKPOT! 🎊';
        } else if (jackpotCount === 3) {
            winnings = bet * 25;
            winType = '💎 MAJOR WIN! 💎';
        } else if (result[0] === result[1] && result[1] === result[2] && result[2] === result[3] && result[3] === result[4]) {
            winnings = bet * 50;
            winType = '⭐ QUINTUPLE MATCH! ⭐';
        } else if (result.slice(0, 4).every(s => s === result[0])) {
            winnings = bet * 20;
            winType = '🔥 QUAD MATCH! 🔥';
        } else if (result.slice(0, 3).every(s => s === result[0])) {
            winnings = bet * 8;
            winType = '✨ TRIPLE MATCH! ✨';
        } else if (result.slice(0, 2).every(s => s === result[0])) {
            winnings = bet * 2;
            winType = '💫 DOUBLE MATCH! 💫';
        }
        
        userData.saldo -= bet;
        if (winnings > 0) {
            userData.saldo += winnings;
        }
        
        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        
        if (jackpotWon) {
            userData.statistik.jackpot_won = (userData.statistik.jackpot_won || 0) + 1;
        }
        
        client.db.save(client.database);
        
        const playButton = new ButtonBuilder()
            .setCustomId(`progressive_${bet}_${message.author.id}`)
            .setLabel(`Spin (${bet})`)
            .setStyle(ButtonStyle.Success)
            .setEmoji('🎰');
            
        const maxButton = new ButtonBuilder()
            .setCustomId(`progressive_${Math.min(userData.saldo, 5000)}_${message.author.id}`)
            .setLabel('Max Spin (5000)')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🏆');
            
        const row = new ActionRowBuilder().addComponents(playButton, maxButton);
        
        const resultDisplay = [
            '```',
            '🏆 PROGRESSIVE JACKPOT SLOT 🏆',
            '┌─────────────────────────────┐',
            `│  ${result.join('  │  ')}  │`,
            '└─────────────────────────────┘',
            '```'
        ].join('\n');
        
        const embed = new EmbedBuilder()
            .setColor(jackpotWon ? '#FFD700' : winnings > 0 ? '#00FF00' : '#FF0000')
            .setTitle('🎰 PROGRESSIVE SLOT MACHINE')
            .setDescription(resultDisplay)
            .addFields(
                { name: 'Current Jackpot', value: `🏆 ${progressive.jackpot.toLocaleString()} koin`, inline: true },
                { name: 'Hasil', value: winnings > 0 ? `${winType}\n+${winnings.toLocaleString()} koin` : `Kalah! -${bet} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo.toLocaleString()} koin`, inline: true }
            );
            
        if (progressive.lastWinner) {
            embed.addFields({ name: 'Last Jackpot Winner', value: progressive.lastWinner, inline: true });
        }
        
        embed.addFields({ name: 'Total Players', value: progressive.totalPlayers.toString(), inline: true });
        
        if (jackpotWon) {
            embed.setFooter({ text: '🎊 SELAMAT! KAMU MEMENANGKAN PROGRESSIVE JACKPOT! 🎊' });
        } else if (jackpotCount >= 3) {
            embed.setFooter({ text: `🏆 ${jackpotCount} Jackpot Symbols! So close! 🏆` });
        }
        
        message.reply({ embeds: [embed], components: [row] });
        
        if (jackpotWon) {
            setTimeout(() => {
                message.channel.send(`🎊 **BREAKING NEWS!** 🎊\n${message.author.username} telah memenangkan Progressive Jackpot sebesar **${winnings.toLocaleString()} koin**! 🏆`);
            }, 2000);
        }
    }
};