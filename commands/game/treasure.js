const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'treasure',
    description: 'Buru harta karun dengan peta treasure',
    aliases: ['harta'],
    cooldown: 15,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        const cost = 100;
        
        if (userData.saldo < cost) {
            return message.reply('Lo butuh 100 koin buat beli peta harta karun!');
        }
        
        userData.saldo -= cost;
        
        const locations = [
            { name: "Pulau Terpencil", difficulty: "Easy", multiplier: 2 },
            { name: "Gua Misterius", difficulty: "Medium", multiplier: 3 },
            { name: "Kuil Kuno", difficulty: "Hard", multiplier: 5 },
            { name: "Kastil Berhantu", difficulty: "Expert", multiplier: 8 },
            { name: "Dimensi Lain", difficulty: "Legendary", multiplier: 12 }
        ];
        
        const location = locations[Math.floor(Math.random() * locations.length)];
        
        const treasures = [
            { name: "Koin Emas Kuno", value: 400, emoji: "🏺" },
            { name: "Permata Langka", value: 600, emoji: "💎" },
            { name: "Pedang Legendaris", value: 800, emoji: "⚔️" },
            { name: "Mahkota Raja", value: 1000, emoji: "👑" },
            { name: "Kitab Sihir", value: 1200, emoji: "📜" }
        ];
        
        const foundTreasure = treasures[Math.floor(Math.random() * treasures.length)];
        const isSuccess = Math.random() > (0.1 * locations.indexOf(location));
        
        let reward = 0;
        let result, color;
        
        if (isSuccess) {
            reward = Math.floor(foundTreasure.value * location.multiplier);
            userData.saldo += reward;
            result = `BERHASIL! Lo nemuin ${foundTreasure.name} di ${location.name}!`;
            color = '#FFD700';
        } else {
            result = `GAGAL! Lo ga nemuin apa-apa di ${location.name}. Mungkin peta nya palsu...`;
            color = '#8B4513';
        }
        
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🗺️ Treasure Hunt')
            .setDescription(result)
            .addFields(
                { name: 'Lokasi', value: `${location.name} (${location.difficulty})`, inline: true },
                { name: 'Harta', value: `${foundTreasure.emoji} ${foundTreasure.name}`, inline: true },
                { name: 'Reward', value: `${reward} koin`, inline: true },
                { name: 'Profit', value: `${reward - cost} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            );
            
        message.reply({ embeds: [embed] });
    }
};