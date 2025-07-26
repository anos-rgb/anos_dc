const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tiktok',
    description: 'Bikin konten TikTok viral buat dapetin gift',
    aliases: ['tt', 'viral'],
    cooldown: 2,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const now = Date.now();
        const lastPost = userData.statistik.tiktok_terakhir || 0;
        const timeLeft = 900000 - (now - lastPost);
        
        if (lastPost && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            return message.reply(`Video TikTok lo masih trending! Tunggu ${minutes} menit.`);
        }
        
        const trends = [
            { name: "Dance Challenge", viral: 70, gift: [50, 300] },
            { name: "Komedi Receh", viral: 60, gift: [80, 250] },
            { name: "Life Hack", viral: 50, gift: [100, 200] },
            { name: "POV Content", viral: 65, gift: [60, 280] },
            { name: "Duet Viral", viral: 80, gift: [120, 400] },
            { name: "Transition", viral: 55, gift: [70, 220] }
        ];
        
        const trend = trends[Math.floor(Math.random() * trends.length)];
        const viralChance = Math.floor(Math.random() * 100);
        
        let multiplier = 1;
        let status = "Biasa aja";
        
        if (viralChance <= trend.viral) {
            if (viralChance <= 10) {
                multiplier = 5;
                status = "🔥 VIRAL BANGET!";
            } else if (viralChance <= 30) {
                multiplier = 3;
                status = "✨ Trending!";
            } else {
                multiplier = 2;
                status = "👍 Lumayan viral";
            }
        }
        
        const baseGift = Math.floor(Math.random() * (trend.gift[1] - trend.gift[0] + 1)) + trend.gift[0];
        const totalGift = Math.floor(baseGift * multiplier);
        
        const followersGain = Math.floor(totalGift / 10);
        const currentFollowers = userData.statistik.tiktok_followers || 0;
        const newFollowers = currentFollowers + followersGain;
        
        const followerBonus = Math.floor(newFollowers / 100) * 10;
        const finalEarn = totalGift + followerBonus;
        
        userData.saldo += finalEarn;
        userData.statistik.tiktok_terakhir = now;
        userData.statistik.tiktok_followers = newFollowers;
        userData.statistik.command_digunakan++;
        
        client.database.statistik_game.penghasilan_harian += finalEarn;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#FF0050')
            .setTitle('🎵 TikTok Viral')
            .setDescription(`Video "${trend.name}" lo ${status}`)
            .addFields(
                { name: 'Base Gift', value: `${baseGift} koin`, inline: true },
                { name: 'Viral Multiplier', value: `x${multiplier}`, inline: true },
                { name: 'Gift Total', value: `${totalGift} koin`, inline: true },
                { name: 'Followers Gain', value: `+${followersGain}`, inline: true },
                { name: 'Follower Bonus', value: `${followerBonus} koin`, inline: true },
                { name: 'Total Followers', value: `${newFollowers.toLocaleString()}`, inline: true },
                { name: 'Total Earned', value: `${finalEarn} koin`, inline: false },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: 'Post terus buat chance viral lebih besar!' });
            
        message.reply({ embeds: [embed] });
    }
};