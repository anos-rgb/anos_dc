const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'slot',
    description: 'Main berbagai jenis mesin slot',
    cooldown: 3,
    execute(message, args, client) {
        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🎰 Pilih Jenis Slot')
                .setDescription('Ketik `!slot [jenis] [taruhan]`\n\n**Jenis Slot:**')
                .addFields(
                    { name: '🍎 Classic', value: '`!slot classic 100`\nSlot buah klasik', inline: true },
                    { name: '💎 Diamond', value: '`!slot diamond 100`\nSlot berlian mewah', inline: true },
                    { name: '🐾 Animal', value: '`!slot animal 100`\nSlot hewan lucu', inline: true },
                    { name: '🌟 Lucky', value: '`!slot lucky 100`\nSlot keberuntungan', inline: true },
                    { name: '🎪 Carnival', value: '`!slot carnival 100`\nSlot karnaval', inline: true },
                    { name: '🚀 Space', value: '`!slot space 100`\nSlot luar angkasa', inline: true }
                );
            
            return message.reply({ embeds: [embed] });
        }

        const slotType = args[0].toLowerCase();
        const bet = parseInt(args[1]);
        
        if (!bet || isNaN(bet) || bet <= 0) {
            return message.reply('Format salah! Contoh: `!slot classic 100`');
        }

        const userData = client.database.users[message.author.id];
        
        if (userData.saldo < bet) {
            return message.reply(`Saldo kamu cuma ${userData.saldo} koin, ga cukup buat taruhan segitu!`);
        }

        let slotConfig;
        
        switch(slotType) {
            case 'classic':
                slotConfig = getClassicSlot();
                break;
            case 'diamond':
                slotConfig = getDiamondSlot();
                break;
            case 'animal':
                slotConfig = getAnimalSlot();
                break;
            case 'lucky':
                slotConfig = getLuckySlot();
                break;
            case 'carnival':
                slotConfig = getCarnivalSlot();
                break;
            case 'space':
                slotConfig = getSpaceSlot();
                break;
            default:
                return message.reply('Jenis slot tidak valid! Ketik `!slot` untuk melihat daftar.');
        }

        const result = [];
        for (let i = 0; i < 3; i++) {
            result.push(slotConfig.symbols[Math.floor(Math.random() * slotConfig.symbols.length)]);
        }

        let winnings = 0;
        let winType = '';

        if (result[0] === result[1] && result[1] === result[2]) {
            const symbol = result[0];
            if (slotConfig.jackpots[symbol]) {
                winnings = bet * slotConfig.jackpots[symbol];
                winType = slotConfig.jackpots[symbol] >= 10 ? 'MEGA JACKPOT!' : 'JACKPOT!';
            } else {
                winnings = bet * 3;
                winType = 'Triple Match!';
            }
        } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
            winnings = Math.floor(bet * 1.5);
            winType = 'Pair Match!';
        } else if (slotConfig.special && slotConfig.special.some(combo => 
            combo.every(symbol => result.includes(symbol)))) {
            winnings = bet * 2;
            winType = 'Special Combo!';
        }

        userData.saldo -= bet;
        if (winnings > 0) {
            userData.saldo += winnings;
        }

        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        client.db.save(client.database);

        const playAgainButton = new ButtonBuilder()
            .setCustomId(`slot_${slotType}_${bet}_${message.author.id}`)
            .setLabel(`Main Lagi (${bet})`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎰');
            
        const doubleButton = new ButtonBuilder()
            .setCustomId(`slot_${slotType}_${bet*2}_${message.author.id}`)
            .setLabel(`Double (${bet*2})`)
            .setStyle(ButtonStyle.Danger)
            .setEmoji('💸');
            
        const row = new ActionRowBuilder().addComponents(playAgainButton, doubleButton);

        const embed = new EmbedBuilder()
            .setColor(winnings > 0 ? '#00FF00' : '#FF0000')
            .setTitle(`${slotConfig.title}`)
            .setDescription(`**[ ${result.join(' | ')} ]**`)
            .addFields(
                { name: 'Hasil', value: winnings > 0 ? `${winType} +${winnings} koin` : `Kalah! -${bet} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            );
            
        message.reply({ embeds: [embed], components: [row] });
    }
};

function getClassicSlot() {
    return {
        title: '🍎 Classic Fruit Slot',
        symbols: ['🍎', '🍌', '🍊', '🍓', '🍒', '🍇', '7️⃣', '💰'],
        jackpots: {
            '7️⃣': 15,
            '💰': 10,
            '🍒': 8,
            '🍓': 6,
            '🍎': 5
        }
    };
}

function getDiamondSlot() {
    return {
        title: '💎 Diamond Luxury Slot',
        symbols: ['💎', '💍', '👑', '🏆', '💰', '⭐', '🔥', '✨'],
        jackpots: {
            '💎': 20,
            '👑': 15,
            '🏆': 12,
            '💍': 10,
            '💰': 8
        }
    };
}

function getAnimalSlot() {
    return {
        title: '🐾 Animal Safari Slot',
        symbols: ['🦁', '🐯', '🐻', '🐼', '🦊', '🐺', '🦄', '🐲'],
        jackpots: {
            '🦄': 25,
            '🐲': 20,
            '🦁': 12,
            '🐯': 10,
            '🐻': 8
        },
        special: [['🦁', '🐯', '🐻']]
    };
}

function getLuckySlot() {
    return {
        title: '🌟 Lucky Charm Slot',
        symbols: ['🍀', '🌟', '🎰', '🎲', '🔮', '🧿', '⚡', '🌈'],
        jackpots: {
            '🍀': 30,
            '🌟': 18,
            '🎰': 15,
            '🔮': 12,
            '🎲': 10
        },
        special: [['🍀', '🌟', '🌈']]
    };
}

function getCarnivalSlot() {
    return {
        title: '🎪 Carnival Fun Slot',
        symbols: ['🎪', '🎠', '🎡', '🎢', '🍭', '🎈', '🎊', '🎉'],
        jackpots: {
            '🎪': 22,
            '🎠': 16,
            '🎡': 14,
            '🎢': 12,
            '🍭': 8
        }
    };
}

function getSpaceSlot() {
    return {
        title: '🚀 Space Adventure Slot',
        symbols: ['🚀', '🛸', '👽', '🌙', '⭐', '🪐', '☄️', '🌌'],
        jackpots: {
            '🛸': 35,
            '🚀': 25,
            '👽': 18,
            '🪐': 15,
            '🌙': 12
        },
        special: [['🚀', '🛸', '👽']]
    };
}