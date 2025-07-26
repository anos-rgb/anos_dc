const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'arena',
    description: 'Bertarung di arena gladiator',
    aliases: ['gladiator', 'combat'],
    cooldown: 35,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const entryFee = 200;
        if (userData.saldo < entryFee) {
            return message.reply(`Lo butuh minimal ${entryFee} koin buat masuk arena!`);
        }
        
        const monsters = [
            { name: 'Goblin Kecil', emoji: '👹', hp: 50, attack: 15, reward: 400 },
            { name: 'Orc Warrior', emoji: '👺', hp: 80, attack: 25, reward: 700 },
            { name: 'Skeleton Knight', emoji: '💀', hp: 120, attack: 35, reward: 1200 },
            { name: 'Dragon Muda', emoji: '🐲', hp: 200, attack: 50, reward: 2000 },
            { name: 'Demon Lord', emoji: '😈', hp: 300, attack: 75, reward: 3500 },
            { name: 'Anos', emoji: '☠️', hp: 500, attack: 85, reward: 5000 }
        ];
        
        const monster = monsters[Math.floor(Math.random() * monsters.length)];
        
        userData.saldo -= entryFee;
        
        let playerHp = 100;
        let monsterHp = monster.hp;
        let rounds = 0;
        
        while (playerHp > 0 && monsterHp > 0 && rounds < 10) {
            const playerAttack = Math.floor(Math.random() * 30) + 20;
            const monsterAttack = Math.floor(Math.random() * monster.attack) + 10;
            
            monsterHp -= playerAttack;
            if (monsterHp > 0) {
                playerHp -= monsterAttack;
            }
            
            rounds++;
        }
        
        if (monsterHp <= 0) {
            const winBonus = Math.random() < 0.3 ? 1.5 : 1;
            const finalReward = Math.floor(monster.reward * winBonus);
            
            userData.saldo += finalReward;
            userData.statistik.command_digunakan++;
            client.database.statistik_game.penghasilan_harian += finalReward;
            client.database.statistik_game.total_kemenangan++;
            
            client.db.save(client.database);
            
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('⚔️ Kemenangan Arena!')
                .setDescription(`Lo berhasil ngalahin ${monster.emoji} ${monster.name}!`)
                .addFields(
                    { name: 'Monster', value: `${monster.emoji} ${monster.name}`, inline: true },
                    { name: 'HP Tersisa', value: `${playerHp}/100`, inline: true },
                    { name: 'Rounds', value: `${rounds}`, inline: true },
                    { name: 'Entry Fee', value: `${entryFee} koin`, inline: true },
                    { name: 'Reward', value: `${finalReward} koin`, inline: true },
                    { name: 'Net Profit', value: `${finalReward - entryFee} koin`, inline: true },
                    { name: 'Saldo', value: `${userData.saldo} koin`, inline: false }
                )
                .setFooter({ text: winBonus > 1 ? '🎉 Flawless victory! Bonus reward!' : 'Crowd goes wild!' });
                
            return message.reply({ embeds: [embed] });
        }
        
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#FF4757')
            .setTitle('⚔️ Kekalahan Arena!')
            .setDescription(`Lo kalah sama ${monster.emoji} ${monster.name}!`)
            .addFields(
                { name: 'Monster', value: `${monster.emoji} ${monster.name}`, inline: true },
                { name: 'Monster HP', value: `${monsterHp}/${monster.hp}`, inline: true },
                { name: 'Rounds', value: `${rounds}`, inline: true },
                { name: 'Entry Fee', value: `${entryFee} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: 'Train harder and come back stronger!' });
            
        message.reply({ embeds: [embed] });
    }
};