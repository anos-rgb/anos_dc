const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'speedclick',
    description: 'Game speed clicking buat dapetin koin',
    aliases: ['click', 'clicker'],
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const clickCount = Math.floor(Math.random() * 50) + 10;
        const timeLimit = Math.floor(Math.random() * 3) + 8;
        const clickSpeed = clickCount / timeLimit;
        
        let reward = 0;
        let performance = '';
        let color = '';
        
        if (clickSpeed >= 8) {
            reward = Math.floor(clickCount * 15);
            performance = 'LIGHTNING FAST!';
            color = '#FFD700';
        } else if (clickSpeed >= 6) {
            reward = Math.floor(clickCount * 12);
            performance = 'Very Fast!';
            color = '#FF6347';
        } else if (clickSpeed >= 4) {
            reward = Math.floor(clickCount * 8);
            performance = 'Fast';
            color = '#32CD32';
        } else if (clickSpeed >= 2) {
            reward = Math.floor(clickCount * 5);
            performance = 'Average';
            color = '#FFA500';
        } else {
            reward = Math.floor(clickCount * 2);
            performance = 'Slow';
            color = '#808080';
        }
        
        const accuracyBonus = Math.floor(Math.random() * 50) + 50;
        const finalReward = Math.floor(reward * (accuracyBonus / 100));
        
        userData.saldo += finalReward;
        userData.statistik.command_digunakan++;
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('⚡ Speed Click Challenge')
            .setDescription(`${performance} Lo berhasil click dengan kecepatan tinggi!`)
            .addFields(
                { name: 'Clicks', value: `${clickCount} clicks`, inline: true },
                { name: 'Time', value: `${timeLimit} detik`, inline: true },
                { name: 'Speed', value: `${clickSpeed.toFixed(1)} CPS`, inline: true },
                { name: 'Accuracy', value: `${accuracyBonus}%`, inline: true },
                { name: 'Reward', value: `${finalReward} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            );
            
        message.reply({ embeds: [embed] });
    }
};