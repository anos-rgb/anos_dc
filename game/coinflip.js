const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'coinflip',
    description: 'Lempar koin dengan taruhan',
    aliases: ['flip', 'koin'],
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (!args[0] || !args[1]) {
            return message.reply('Format: `!coinflip <heads/tails> <jumlah_taruhan>`');
        }
        
        const pilihan = args[0].toLowerCase();
        const taruhan = parseInt(args[1]);
        
        if (pilihan !== 'heads' && pilihan !== 'tails' && pilihan !== 'kepala' && pilihan !== 'ekor') {
            return message.reply('Pilihan harus heads/kepala atau tails/ekor!');
        }
        
        if (isNaN(taruhan) || taruhan <= 0) {
            return message.reply('Jumlah taruhan harus berupa angka positif!');
        }
        
        if (userData.saldo < taruhan) {
            return message.reply(`Saldo lo gak cukup! Saldo sekarang: ${userData.saldo} koin`);
        }
        
        const hasil = Math.random() < 0.5 ? 'heads' : 'tails';
        const hasilIndo = hasil === 'heads' ? 'kepala' : 'ekor';
        const pilihanNormalized = (pilihan === 'kepala') ? 'heads' : (pilihan === 'ekor') ? 'tails' : pilihan;
        
        const menang = hasil === pilihanNormalized;
        
        if (menang) {
            userData.saldo += taruhan;
            userData.statistik.command_digunakan++;
            client.database.statistik_game.penghasilan_harian += taruhan;
        } else {
            userData.saldo -= taruhan;
            userData.statistik.command_digunakan++;
        }
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor(menang ? '#55FF55' : '#FF5555')
            .setTitle('🪙 Coinflip')
            .setDescription(`Koin menunjukkan: **${hasilIndo.toUpperCase()}**`)
            .addFields(
                { name: 'Pilihan Lo', value: pilihan, inline: true },
                { name: 'Hasil', value: hasilIndo, inline: true },
                { name: 'Status', value: menang ? '✅ MENANG!' : '❌ KALAH!', inline: true },
                { name: 'Taruhan', value: `${taruhan} koin`, inline: true },
                { name: menang ? 'Dapat' : 'Kehilangan', value: `${taruhan} koin`, inline: true },
                { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: menang ? 'Hoki banget!' : 'Coba lagi next time!' });
            
        message.reply({ embeds: [embed] });
    }
};