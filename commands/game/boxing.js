const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'boxing',
    description: 'Tinju untuk dapetin hadiah',
    aliases: ['tinju', 'fight'],
    cooldown: 30,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const opponents = [
            { name: 'Pemula Lemah', emoji: '🤓', reward: 300, difficulty: 0.8 },
            { name: 'Atlet Sekolah', emoji: '🏃', reward: 500, difficulty: 0.6 },
            { name: 'Petinju Amatir', emoji: '🥊', reward: 800, difficulty: 0.4 },
            { name: 'Petinju Pro', emoji: '💪', reward: 1500, difficulty: 0.25 },
            { name: 'Anos', emoji: '🏆', reward: 3000, difficulty: 0.1 }
        ];
        
        const opponent = opponents[Math.floor(Math.random() * opponents.length)];
        
        const fightResult = Math.random();
        const isWin = fightResult <= opponent.difficulty;
        
        if (!isWin) {
            const injury = Math.floor(userData.saldo * 0.05);
            userData.saldo = Math.max(0, userData.saldo - injury);
            userData.statistik.command_digunakan++;
            
            client.db.save(client.database);
            
            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('🥊 Kalah Tinju!')
                .setDescription(`Lo kalah sama ${opponent.emoji} ${opponent.name}!`)
                .addFields(
                    { name: 'Lawan', value: `${opponent.emoji} ${opponent.name}`, inline: true },
                    { name: 'Biaya Dokter', value: `${injury} koin`, inline: true },
                    { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Latihan dulu bro!' });
                
            return message.reply({ embeds: [embed] });
        }
        
        const criticalHit = Math.random() < 0.2 ? 2 : 1;
        const finalReward = opponent.reward * criticalHit;
        
        userData.saldo += finalReward;
        userData.statistik.command_digunakan++;
        client.database.statistik_game.penghasilan_harian += finalReward;
        client.database.statistik_game.total_kemenangan++;
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#4ECDC4')
            .setTitle('🥊 Menang Tinju!')
            .setDescription(`Lo ngalahin ${opponent.emoji} ${opponent.name}!`)
            .addFields(
                { name: 'Lawan', value: `${opponent.emoji} ${opponent.name}`, inline: true },
                { name: 'Hadiah', value: `${finalReward} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: criticalHit > 1 ? '💥 KNOCKOUT! Double reward!' : 'Champion!' });
            
        message.reply({ embeds: [embed] });
    }
};