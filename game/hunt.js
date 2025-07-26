const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'hunt',
    description: 'Berburu hewan untuk dapetin koin',
    aliases: ['berburu', 'hunting'],
    cooldown: 25,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const animals = [
            { name: 'Kelinci', emoji: '🐰', reward: 150, chance: 0.7 },
            { name: 'Rusa', emoji: '🦌', reward: 300, chance: 0.5 },
            { name: 'Babi Hutan', emoji: '🐗', reward: 500, chance: 0.3 },
            { name: 'Beruang', emoji: '🐻', reward: 800, chance: 0.2 },
            { name: 'Serigala', emoji: '🐺', reward: 600, chance: 0.25 },
            { name: 'Elang', emoji: '🦅', reward: 400, chance: 0.4 }
        ];
        
        const huntResult = Math.random();
        const foundAnimal = animals.find(animal => huntResult <= animal.chance);
        
        if (!foundAnimal) {
            userData.statistik.command_digunakan++;
            client.db.save(client.database);
            
            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('🎯 Berburu Gagal!')
                .setDescription('Lo ga berhasil nangkep hewan apapun hari ini. Coba lagi nanti!')
                .setFooter({ text: 'Latihan aim dulu bro!' });
                
            return message.reply({ embeds: [embed] });
        }
        
        const bonusMultiplier = Math.random() < 0.15 ? 1.5 : 1;
        const finalReward = Math.floor(foundAnimal.reward * bonusMultiplier);
        
        userData.saldo += finalReward;
        userData.statistik.command_digunakan++;
        client.database.statistik_game.penghasilan_harian += finalReward;
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#4ECDC4')
            .setTitle('🎯 Berburu Berhasil!')
            .setDescription(`Lo berhasil berburu ${foundAnimal.emoji} ${foundAnimal.name}!`)
            .addFields(
                { name: 'Hewan', value: `${foundAnimal.emoji} ${foundAnimal.name}`, inline: true },
                { name: 'Reward', value: `${finalReward} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: bonusMultiplier > 1 ? '🎉 Perfect shot! Bonus reward!' : 'Good hunting!' });
            
        message.reply({ embeds: [embed] });
    }
};