const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'horeg',
    description: 'Ngoding sambil dengerin horeg dapet koin!',
    aliases: ['jawa', 'musik'],
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const now = Date.now();
        const lastHoreg = userData.statistik.horeg_terakhir || 0;
        const timeLeft = 86400000 - (now - lastHoreg);
        
        if (lastHoreg && timeLeft > 0) {
            const hours = Math.floor(timeLeft / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);
            
            return message.reply(`WOI JAWA! Lo udah denger horeg hari ini! Tunggu ${hours} jam ${minutes} menit lagi!`);
        }
        
        const horegEvents = [
            { event: "Horeg lewat depan warung", efek: "kaca orang pecah", koin: 300 },
            { event: "Horeg ngebut malem-malem", efek: "telinga orang sakit", koin: 250 },
            { event: "Horeg sound system rusak", efek: "orang meninggal gara gara suara kencenderungan", koin: 500 },
            { event: "Horeg kontes audio", efek: "kaca orang pecah", koin: 400 },
            { event: "Horeg nyetel dangdut koplo", efek: "telinga orang sakit", koin: 350 },
            { event: "Horeg volume maksimal", efek: "orang meninggal gara gara suara kencenderungan", koin: 450 }
        ];
        
        const horeg = horegEvents[Math.floor(Math.random() * horegEvents.length)];
        
        const bonus = Math.floor(Math.random() * 151);
        const totalKoin = horeg.koin + bonus;
        
        userData.saldo += totalKoin;
        userData.statistik.horeg_terakhir = now;
        userData.statistik.command_digunakan++;
        
        client.database.statistik_game.penghasilan_harian += totalKoin;
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#FF5555')
            .setTitle('🚛🔊 WOI JAWA ADA HOREG NIH')
            .setDescription(`${horeg.event}`)
            .addFields(
                { name: 'Efek Samping', value: horeg.efek, inline: false },
                { name: 'DAPAT KOIN=', value: `${horeg.koin} koin`, inline: true },
                { name: 'Bonus Kerusakan', value: `${bonus} koin`, inline: true },
                { name: 'Total Dapet', value: `${totalKoin} koin`, inline: true },
                { name: 'Saldo Lo Sekarang', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: 'Besok ada horeg lagi coy!' });
            
        message.reply({ embeds: [embed] });
    }
};