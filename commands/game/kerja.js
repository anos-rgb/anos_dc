const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kerja',
    description: 'Kerja untuk dapetin koin harian',
    aliases: ['work', 'daily'],
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        // Cek cooldown (24 jam / 86400000 ms)
        const now = Date.now();
        const lastWork = userData.statistik.kerja_terakhir || 0;
        const timeLeft = 86400000 - (now - lastWork);
        
        if (lastWork && timeLeft > 0) {
            const hours = Math.floor(timeLeft / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);
            
            return message.reply(`Lo udah kerja hari ini! Bisa kerja lagi dalam ${hours} jam ${minutes} menit.`);
        }
        
        // List pekerjaan random
        const jobs = [
            { name: "Jadi Admin Discord", pay: 500 },
            { name: "Jualan NFT", pay: 800 },
            { name: "Ngeprank Subscriber", pay: 600 },
            { name: "Jadi Influencer TikTok", pay: 750 },
            { name: "Nge-review Game", pay: 650 },
            { name: "Jadi Programmer Freelance", pay: 900 },
            { name: "Livestreaming", pay: 700 },
            { name: "Bikin Meme", pay: 550 }
        ];
        
        // Pilih job random
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        
        // Random bonus (0-200)
        const bonus = Math.floor(Math.random() * 201);
        const totalPay = job.pay + bonus;
        
        // Update saldo
        userData.saldo += totalPay;
        
        // Update statistik
        userData.statistik.kerja_terakhir = now;
        userData.statistik.command_digunakan++;
        
        // Update statistik server
        client.database.statistik_game.penghasilan_harian += totalPay;
        
        // Simpan database
        client.db.save(client.database);
        
        // Kirim hasil
        const embed = new EmbedBuilder()
            .setColor('#55FF55')
            .setTitle('💼 Kerja Harian')
            .setDescription(`Lo baru aja kerja sebagai "${job.name}"!`)
            .addFields(
                { name: 'Gaji Pokok', value: `${job.pay} koin`, inline: true },
                { name: 'Bonus', value: `${bonus} koin`, inline: true },
                { name: 'Total', value: `${totalPay} koin`, inline: true },
                { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: 'Dateng lagi besok buat kerja harian!' });
            
        message.reply({ embeds: [embed] });
    }
};