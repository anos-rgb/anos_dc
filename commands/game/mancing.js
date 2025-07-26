const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'mancing',
    description: 'Pergi memancing untuk dapetin koin',
    aliases: ['fishing', 'pancing'],
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const hasBetterRod = userData.inventori.includes('fishing_rod');
        
        const fishes = [
            { name: "Ikan Teri", value: 50, chance: 30 },
            { name: "Ikan Mas", value: 100, chance: 25 },
            { name: "Ikan Nila", value: 150, chance: 20 },
            { name: "Ikan Lele", value: 200, chance: 15 },
            { name: "Ikan Salmon", value: 500, chance: 7 },
            { name: "Ikan Paus Kecil", value: 1000, chance: 2 },
            { name: "Ikan Legendaris", value: 2000, chance: 1 }
        ];
        
        let weightedFishes = [];
        
        fishes.forEach(fish => {
            let adjustedChance = fish.chance;
            if (hasBetterRod && fish.value >= 500) {
                adjustedChance *= 2;
            }
            
            for (let i = 0; i < adjustedChance; i++) {
                weightedFishes.push(fish);
            }
        });
        
        const caughtFish = weightedFishes[Math.floor(Math.random() * weightedFishes.length)];
        
        userData.saldo += caughtFish.value;
        
        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#00BFFF')
            .setTitle('🎣 Memancing')
            .setDescription(`Lo dapet ${caughtFish.name}!${hasBetterRod ? ' (Bonus Fishing Rod++)' : ''}`)
            .addFields(
                { name: 'Nilai', value: `${caughtFish.value} koin`, inline: true },
                { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: hasBetterRod ? 'Fishing Rod++ meningkatkan peluang dapet ikan langka!' : 'Gunakan !mancing untuk memancing lagi!' });
            
        message.reply({ embeds: [embed] });
    }
};