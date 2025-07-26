const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'gacha',
    description: 'Gacha untuk dapetin hadiah random',
    aliases: ['pull', 'summon'],
    cooldown: 3,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        const cost = 200;
        
        if (userData.saldo < cost) {
            return message.reply('Lo butuh 200 koin buat gacha!');
        }
        
        userData.saldo -= cost;
        
        const prizes = [
            { name: "Koin Emas", value: 1000, rarity: "Legendary", chance: 2, emoji: "🏆" },
            { name: "Jackpot Mini", value: 800, rarity: "Epic", chance: 5, emoji: "💎" },
            { name: "Bonus Besar", value: 500, rarity: "Rare", chance: 15, emoji: "💰" },
            { name: "Koin Perak", value: 300, rarity: "Uncommon", chance: 28, emoji: "🥈" },
            { name: "Koin Biasa", value: 150, rarity: "Common", chance: 50, emoji: "🪙" }
        ];
        
        const roll = Math.random() * 100;
        let cumulativeChance = 0;
        let wonPrize = null;
        
        for (const prize of prizes) {
            cumulativeChance += prize.chance;
            if (roll <= cumulativeChance) {
                wonPrize = prize;
                break;
            }
        }
        
        userData.saldo += wonPrize.value;
        userData.statistik.command_digunakan++;
        
        let color;
        switch (wonPrize.rarity) {
            case "Legendary": color = '#FFD700'; break;
            case "Epic": color = '#9932CC'; break;
            case "Rare": color = '#1E90FF'; break;
            case "Uncommon": color = '#32CD32'; break;
            default: color = '#808080';
        }
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🎲 Gacha Result')
            .setDescription(`${wonPrize.emoji} **${wonPrize.name}** (${wonPrize.rarity})`)
            .addFields(
                { name: 'Hadiah', value: `${wonPrize.value} koin`, inline: true },
                { name: 'Profit', value: `${wonPrize.value - cost} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            );
            
        message.reply({ embeds: [embed] });
    }
};