const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'youtube',
    description: 'Bikin konten YouTube buat dapetin ad revenue',
    aliases: ['yt', 'content'],
    cooldown: 4,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const now = Date.now();
        const lastUpload = userData.statistik.youtube_terakhir || 0;
        const timeLeft = 2700000 - (now - lastUpload);
        
        if (lastUpload && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            return message.reply(`Video lo masih diproses! Tunggu ${minutes} menit lagi.`);
        }
        
        const contentTypes = [
            { name: "Gaming Montage", views: [1000, 5000], cpm: 2 },
            { name: "Tutorial", views: [500, 3000], cpm: 3 },
            { name: "Vlog Harian", views: [800, 4000], cpm: 1.5 },
            { name: "Review Produk", views: [1200, 6000], cpm: 4 },
            { name: "Prank Video", views: [2000, 8000], cmp: 1.8 },
            { name: "Mukbang", views: [600, 3500], cpm: 2.5 }
        ];
        
        const content = contentTypes[Math.floor(Math.random() * contentTypes.length)];
        const views = Math.floor(Math.random() * (content.views[1] - content.views[0] + 1)) + content.views[0];
        const cpm = content.cpm || 2;
        
        const adRevenue = Math.floor((views / 1000) * cpm * 100);
        
        const subscriber = userData.statistik.youtube_subscriber || 0;
        const subscriberBonus = Math.floor(subscriber * 0.5);
        
        const qualityBonus = Math.floor(Math.random() * 200);
        
        const totalEarn = adRevenue + subscriberBonus + qualityBonus;
        
        userData.saldo += totalEarn;
        userData.statistik.youtube_terakhir = now;
        userData.statistik.youtube_subscriber = subscriber + Math.floor(views / 100);
        userData.statistik.command_digunakan++;
        
        client.database.statistik_game.penghasilan_harian += totalEarn;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('📺 YouTube Creator')
            .setDescription(`Video "${content.name}" lo udah upload!`)
            .addFields(
                { name: 'Views', value: `${views.toLocaleString()}`, inline: true },
                { name: 'Ad Revenue', value: `${adRevenue} koin`, inline: true },
                { name: 'Quality Bonus', value: `${qualityBonus} koin`, inline: true },
                { name: 'Subscriber Bonus', value: `${subscriberBonus} koin`, inline: true },
                { name: 'Total Subscribers', value: `${userData.statistik.youtube_subscriber.toLocaleString()}`, inline: true },
                { name: 'Total Earned', value: `${totalEarn} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: 'Makin banyak subscriber, makin besar bonus!' });
            
        message.reply({ embeds: [embed] });
    }
};