const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'instagram',
    description: 'Post di Instagram buat dapetin sponsor dan endorsement',
    aliases: ['ig', 'insta'],
    cooldown: 6,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const now = Date.now();
        const lastPost = userData.statistik.instagram_terakhir || 0;
        const timeLeft = 3600000 - (now - lastPost);
        
        if (lastPost && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            return message.reply(`Lo baru aja posting! Tunggu ${minutes} menit buat post lagi.`);
        }
        
        const postTypes = [
            { name: "Foto OOTD", engagement: [500, 2000], rate: 0.5 },
            { name: "Food Review", engagement: [800, 3000], rate: 0.7 },
            { name: "Travel Post", engagement: [1000, 4000], rate: 0.8 },
            { name: "Selfie", engagement: [300, 1500], rate: 0.3 },
            { name: "Product Review", engagement: [1200, 5000], rate: 1.2 },
            { name: "Lifestyle", engagement: [600, 2500], rate: 0.6 }
        ];
        
        const post = postTypes[Math.floor(Math.random() * postTypes.length)];
        const engagement = Math.floor(Math.random() * (post.engagement[1] - post.engagement[0] + 1)) + post.engagement[0];
        
        const sponsorChance = Math.floor(Math.random() * 100);
        let sponsorMoney = 0;
        let sponsorText = "";
        
        if (sponsorChance <= 20) {
            sponsorMoney = Math.floor(Math.random() * 800) + 200;
            sponsorText = "🎯 Dapet sponsor!";
        } else if (sponsorChance <= 40) {
            sponsorMoney = Math.floor(Math.random() * 400) + 100;
            sponsorText = "💼 Ada endorsement kecil";
        }
        
        const baseEarn = Math.floor(engagement * post.rate);
        const followers = userData.statistik.instagram_followers || 0;
        const followerBonus = Math.floor(followers / 1000) * 50;
        
        const hashtagBonus = Math.floor(Math.random() * 100);
        const totalEarn = baseEarn + sponsorMoney + followerBonus + hashtagBonus;
        
        const followerGain = Math.floor(engagement / 20);
        const newFollowers = followers + followerGain;
        
        userData.saldo += totalEarn;
        userData.statistik.instagram_terakhir = now;
        userData.statistik.instagram_followers = newFollowers;
        userData.statistik.command_digunakan++;
        
        client.database.statistik_game.penghasilan_harian += totalEarn;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#E4405F')
            .setTitle('📸 Instagram Post')
            .setDescription(`Post "${post.name}" lo dapet banyak engagement!\n${sponsorText}`)
            .addFields(
                { name: 'Likes & Comments', value: `${engagement.toLocaleString()}`, inline: true },
                { name: 'Base Earning', value: `${baseEarn} koin`, inline: true },
                { name: 'Sponsor/Endorse', value: `${sponsorMoney} koin`, inline: true },
                { name: 'Follower Bonus', value: `${followerBonus} koin`, inline: true },
                { name: 'Hashtag Bonus', value: `${hashtagBonus} koin`, inline: true },
                { name: 'Followers Gain', value: `+${followerGain}`, inline: true },
                { name: 'Total Followers', value: `${newFollowers.toLocaleString()}`, inline: true },
                { name: 'Total Earned', value: `${totalEarn} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: 'Makin banyak followers, makin gede sponsor!' });
            
        message.reply({ embeds: [embed] });
    }
};