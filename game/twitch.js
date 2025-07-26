const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'twitch',
    description: 'Stream di Twitch buat dapetin donation dan subscriber',
    aliases: ['stream', 'donate'],
    cooldown: 7,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const now = Date.now();
        const lastStream = userData.statistik.twitch_terakhir || 0;
        const timeLeft = 5400000 - (now - lastStream);
        
        if (lastStream && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            return message.reply(`Stream lo masih offline! Bisa stream lagi dalam ${minutes} menit.`);
        }
        
        const streamGames = [
            { name: "Valorant", viewers: [100, 500], sub: [5, 25], donation: [200, 800] },
            { name: "League of Legends", viewers: [150, 600], sub: [8, 30], donation: [250, 900] },
            { name: "Just Chatting", viewers: [80, 400], sub: [3, 20], donation: [150, 600] },
            { name: "Minecraft", viewers: [120, 450], sub: [6, 28], donation: [180, 700] },
            { name: "Counter Strike 2", viewers: [200, 700], sub: [10, 35], donation: [300, 1000] },
            { name: "GTA V RP", viewers: [180, 650], sub: [12, 40], donation: [280, 950] }
        ];
        
        const game = streamGames[Math.floor(Math.random() * streamGames.length)];
        const viewers = Math.floor(Math.random() * (game.viewers[1] - game.viewers[0] + 1)) + game.viewers[0];
        const newSubs = Math.floor(Math.random() * (game.sub[1] - game.sub[0] + 1)) + game.sub[0];
        const donations = Math.floor(Math.random() * (game.donation[1] - game.donation[0] + 1)) + game.donation[0];
        
        const adRevenue = Math.floor(viewers * 1.5);
        const subRevenue = newSubs * 25;
        
        const raidChance = Math.floor(Math.random() * 100);
        let raidBonus = 0;
        let raidText = "";
        
        if (raidChance <= 15) {
            raidBonus = Math.floor(Math.random() * 500) + 200;
            raidText = "🚀 Dapet raid dari streamer besar!";
        }
        
        const currentSubs = userData.statistik.twitch_subscribers || 0;
        const totalSubs = currentSubs + newSubs;
        const loyaltyBonus = Math.floor(totalSubs / 50) * 100;
        
        const totalEarn = adRevenue + subRevenue + donations + raidBonus + loyaltyBonus;
        
        userData.saldo += totalEarn;
        userData.statistik.twitch_terakhir = now;
        userData.statistik.twitch_subscribers = totalSubs;
        userData.statistik.command_digunakan++;
        
        client.database.statistik_game.penghasilan_harian += totalEarn;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#9146FF')
            .setTitle('🎮 Twitch Stream')
            .setDescription(`Stream "${game.name}" lo rame banget!\n${raidText}`)
            .addFields(
                { name: 'Peak Viewers', value: `${viewers} orang`, inline: true },
                { name: 'New Subscribers', value: `${newSubs} orang`, inline: true },
                { name: 'Ad Revenue', value: `${adRevenue} koin`, inline: true },
                { name: 'Sub Revenue', value: `${subRevenue} koin`, inline: true },
                { name: 'Donations', value: `${donations} koin`, inline: true },
                { name: 'Raid Bonus', value: `${raidBonus} koin`, inline: true },
                { name: 'Loyalty Bonus', value: `${loyaltyBonus} koin`, inline: true },
                { name: 'Total Subscribers', value: `${totalSubs} orang`, inline: true },
                { name: 'Total Earned', value: `${totalEarn} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: 'Makin lama stream, makin banyak subscriber!' });
            
        message.reply({ embeds: [embed] });
    }
};