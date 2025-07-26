const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'wheel',
    description: 'Putar roda keberuntungan',
    cooldown: 8,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        const bet = parseInt(args[0]);
        
        if (!bet || isNaN(bet) || bet <= 0) {
            return message.reply('Format: `!wheel [taruhan]`');
        }
        
        if (userData.saldo < bet) {
            return message.reply(`Saldo kamu ${userData.saldo} koin, kurang dari ${bet} koin!`);
        }
        
        const wheelSections = [
            { emoji: '💥', name: 'BANKRUPT', multiplier: 0, chance: 5 },
            { emoji: '😭', name: 'Lose All', multiplier: -1, chance: 8 },
            { emoji: '💸', name: 'Lose Half', multiplier: -0.5, chance: 12 },
            { emoji: '❌', name: 'Lose Bet', multiplier: 0, chance: 25 },
            { emoji: '🔄', name: 'Return Bet', multiplier: 1, chance: 20 },
            { emoji: '📈', name: 'Small Win', multiplier: 1.5, chance: 15 },
            { emoji: '💰', name: 'Good Win', multiplier: 3, chance: 8 },
            { emoji: '🎊', name: 'Big Win', multiplier: 5, chance: 4 },
            { emoji: '💎', name: 'Mega Win', multiplier: 10, chance: 2 },
            { emoji: '🏆', name: 'JACKPOT', multiplier: 25, chance: 1 }
        ];
        
        const totalChance = wheelSections.reduce((sum, section) => sum + section.chance, 0);
        const random = Math.random() * totalChance;
        let currentChance = 0;
        let selectedSection;
        
        for (const section of wheelSections) {
            currentChance += section.chance;
            if (random <= currentChance) {
                selectedSection = section;
                break;
            }
        }
        
        let result = 0;
        let message_text = '';
        
        userData.saldo -= bet;
        
        if (selectedSection.multiplier === 0) {
            message_text = `${selectedSection.name}! Kehilangan taruhan!`;
        } else if (selectedSection.multiplier === -1) {
            const lost = userData.saldo;
            userData.saldo = 0;
            message_text = `${selectedSection.name}! Kehilangan semua saldo (${lost} koin)!`;
        } else if (selectedSection.multiplier === -0.5) {
            const lost = Math.floor(userData.saldo / 2);
            userData.saldo -= lost;
            message_text = `${selectedSection.name}! Kehilangan ${lost} koin!`;
        } else if (selectedSection.multiplier === 1) {
            userData.saldo += bet;
            message_text = `${selectedSection.name}! Taruhan dikembalikan!`;
        } else {
            result = Math.floor(bet * selectedSection.multiplier);
            userData.saldo += result;
            message_text = `${selectedSection.name}! Menang ${result} koin!`;
        }
        
        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
        
        const spinButton = new ButtonBuilder()
            .setCustomId(`wheel_${bet}_${message.author.id}`)
            .setLabel(`Spin Lagi (${bet})`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎰');
            
        const bigButton = new ButtonBuilder()
            .setCustomId(`wheel_${Math.min(userData.saldo, bet*2)}_${message.author.id}`)
            .setLabel(`Big Spin (${bet*2})`)
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔥');
            
        const row = new ActionRowBuilder().addComponents(spinButton, bigButton);
        
        const wheelDisplay = [
            '```',
            '      🎰 WHEEL OF FORTUNE 🎰',
            '           ┌─────────┐',
            '           │    ▼    │',
            '    ╔══════╪═════════╪══════╗',
            `    ║  💥  │ ${selectedSection.emoji}  ${selectedSection.name.padEnd(7)} │  🎊  ║`,
            '    ╠══════╪═════════╪══════╣',
            '    ║  💸  │         │  💰  ║',
            '    ╚══════╧═════════╧══════╝',
            '```'
        ].join('\n');
        
        const embed = new EmbedBuilder()
            .setColor(result > 0 ? '#00FF00' : selectedSection.multiplier < 0 ? '#8B0000' : '#FFD700')
            .setTitle('🎡 Wheel of Fortune')
            .setDescription(wheelDisplay)
            .addFields(
                { name: 'Hasil', value: message_text, inline: false },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            );
        
        if (selectedSection.multiplier >= 10) {
            embed.setFooter({ text: '🏆 JACKPOT WINNER! 🏆' });
        }
        
        message.reply({ embeds: [embed], components: [row] });
    }
};