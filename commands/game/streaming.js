const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'streaming',
    description: 'Mulai streaming untuk dapetin koin dari viewers',
    aliases: ['stream', 'live'],
    cooldown: 5,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const now = Date.now();
        const lastStream = userData.statistik.streaming_terakhir || 0;
        const timeLeft = 3600000 - (now - lastStream);
        
        if (lastStream && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            return message.reply(`Lo masih capek streaming! Istirahat dulu ${minutes} menit.`);
        }
        
        const games = [
            { name: "Mobile Legends", viewers: [50, 200], donation: [100, 500] },
            { name: "Free Fire", viewers: [80, 300], donation: [150, 600] },
            { name: "Genshin Impact", viewers: [100, 400], donation: [200, 800] },
            { name: "Valorant", viewers: [120, 350], donation: [180, 700] },
            { name: "Minecraft", viewers: [60, 250], donation: [120, 450] },
            { name: "Among Us", viewers: [40, 180], donation: [80, 350] }
        ];
        
        const game = games[Math.floor(Math.random() * games.length)];
        const viewers = Math.floor(Math.random() * (game.viewers[1] - game.viewers[0] + 1)) + game.viewers[0];
        const donations = Math.floor(Math.random() * (game.donation[1] - game.donation[0] + 1)) + game.donation[0];
        
        const viewerPay = viewers * 2;
        const totalEarn = viewerPay + donations;
        
        userData.saldo += totalEarn;
        userData.statistik.streaming_terakhir = now;
        userData.statistik.command_digunakan++;
        
        client.database.statistik_game.penghasilan_harian += totalEarn;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('🎮 Live Streaming')
            .setDescription(`Lo streaming "${game.name}" dan dapet banyak viewers!`)
            .addFields(
                { name: 'Viewers', value: `${viewers} orang`, inline: true },
                { name: 'Dari Viewers', value: `${viewerPay} koin`, inline: true },
                { name: 'Donasi', value: `${donations} koin`, inline: true },
                { name: 'Total Earn', value: `${totalEarn} koin`, inline: false },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: 'Stream lagi dalam 1 jam!' });
            
        message.reply({ embeds: [embed] });
    }
};