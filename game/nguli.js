const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nguli',
    description: 'Nguli keras buat dapetin koin lebih banyak',
    aliases: ['grind', 'hustle'],
    cooldown: 3,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const now = Date.now();
        const lastGrind = userData.statistik.nguli_terakhir || 0;
        const timeLeft = 1800000 - (now - lastGrind);
        
        if (lastGrind && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            return message.reply(`Lo masih capek nguli! Istirahat ${minutes} menit dulu.`);
        }
        
        const jobs = [
            { name: "Jual Pulsa", effort: "ringan", pay: [200, 400] },
            { name: "Jadi Ojol", effort: "sedang", pay: [300, 600] },
            { name: "Freelance Design", effort: "berat", pay: [500, 900] },
            { name: "Jual Online", effort: "ringan", pay: [250, 450] },
            { name: "Jadi Kurir", effort: "sedang", pay: [350, 650] },
            { name: "Coding Project", effort: "berat", pay: [600, 1000] }
        ];
        
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const basePay = Math.floor(Math.random() * (job.pay[1] - job.pay[0] + 1)) + job.pay[0];
        
        let multiplier = 1;
        let effortText = "";
        
        if (job.effort === "sedang") {
            multiplier = 1.2;
            effortText = "💪 Lumayan capek tapi worth it!";
        } else if (job.effort === "berat") {
            multiplier = 1.5;
            effortText = "🔥 Capek banget tapi bayarannya gede!";
        } else {
            effortText = "😊 Santai aja, easy money!";
        }
        
        const totalPay = Math.floor(basePay * multiplier);
        const streak = userData.statistik.nguli_streak || 0;
        const streakBonus = Math.floor(totalPay * (streak * 0.1));
        const finalPay = totalPay + streakBonus;
        
        userData.saldo += finalPay;
        userData.statistik.nguli_terakhir = now;
        userData.statistik.nguli_streak = streak + 1;
        userData.statistik.command_digunakan++;
        
        client.database.statistik_game.penghasilan_harian += finalPay;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#4ECDC4')
            .setTitle('💼 Nguli Keras')
            .setDescription(`Lo nguli jadi "${job.name}"!\n${effortText}`)
            .addFields(
                { name: 'Base Pay', value: `${basePay} koin`, inline: true },
                { name: 'Effort Bonus', value: `x${multiplier}`, inline: true },
                { name: 'Streak Bonus', value: `${streakBonus} koin`, inline: true },
                { name: 'Total Earned', value: `${finalPay} koin`, inline: false },
                { name: 'Streak', value: `${userData.statistik.nguli_streak} kali`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: 'Keep grinding! Streak bonus makin gede!' });
            
        message.reply({ embeds: [embed] });
    }
};