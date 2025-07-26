const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'mining',
    description: 'Nambang crypto buat dapetin koin',
    aliases: ['mine', 'nambang'],
    cooldown: 30,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const now = Date.now();
        const lastMining = userData.statistik.mining_terakhir || 0;
        const timeLeft = 1800000 - (now - lastMining);
        
        if (lastMining && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            return message.reply(`Mining rig lo masih jalan! Tunggu ${minutes} menit ${seconds} detik lagi.`);
        }
        
        const cryptos = [
            { name: "Bitcoin", reward: 1000 },
            { name: "Ethereum", reward: 800 },
            { name: "Dogecoin", reward: 500 },
            { name: "Shiba Inu", reward: 300 },
            { name: "Cardano", reward: 600 },
            { name: "Polygon", reward: 450 }
        ];
        
        const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
        const multiplier = Math.random() < 0.1 ? 2 : 1;
        const finalReward = crypto.reward * multiplier;
        
        userData.saldo += finalReward;
        userData.statistik.mining_terakhir = now;
        userData.statistik.command_digunakan++;
        
        client.database.statistik_game.penghasilan_harian += finalReward;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('⛏️ Mining Complete!')
            .setDescription(`Lo berhasil nambang ${crypto.name}!`)
            .addFields(
                { name: 'Crypto', value: crypto.name, inline: true },
                { name: 'Reward', value: `${finalReward} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: multiplier > 1 ? '🎉 Lucky Strike! Double reward!' : 'Keep mining!' });
            
        message.reply({ embeds: [embed] });
    }
};