const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tebak',
    description: 'Tebak angka 1-10',
    cooldown: 5,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        // Check args
        if (!args[0] || !args[1]) {
            return message.reply('Format salah! Contoh: `!main tebak 5 100` untuk nebak angka 5 dengan taruhan 100 koin');
        }
        
        const guess = parseInt(args[0]);
        const bet = parseInt(args[1]);
        
        // Validate input
        if (isNaN(guess) || guess < 1 || guess > 10) {
            return message.reply('Tebakan harus berupa angka antara 1-10!');
        }
        
        if (isNaN(bet) || bet <= 0) {
            return message.reply('Taruhan harus berupa angka positif!');
        }
        
        // Cek saldo
        if (userData.saldo < bet) {
            return message.reply(`Saldo lo cuma ${userData.saldo} koin, ga cukup buat taruhan segitu!`);
        }
        
        // Generate angka acak
        const correctNumber = Math.floor(Math.random() * 10) + 1;
        
        // Cek hasil
        let winnings = 0;
        let resultMessage = '';
        
        if (guess === correctNumber) {
            winnings = bet * 5;
            resultMessage = `🎉 BENAR! Angkanya emang ${correctNumber}. Lo menang ${winnings} koin!`;
        } else {
            winnings = -bet;
            resultMessage = `❌ SALAH! Angka yang bener adalah ${correctNumber}. Lo kalah ${bet} koin!`;
        }
        
        // Update saldo
        userData.saldo += winnings;
        
        // Update statistik
        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        
        // Simpan database
        client.db.save(client.database);
        
        // Kirim hasil
        const embed = new EmbedBuilder()
            .setColor(winnings > 0 ? '#55FF55' : '#FF5555')
            .setTitle('🔢 Tebak Angka')
            .setDescription(resultMessage)
            .addFields(
                { name: 'Tebakan Lo', value: `${guess}`, inline: true },
                { name: 'Angka Benar', value: `${correctNumber}`, inline: true },
                { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: 'Tebak 1-10, kalo bener dapet 5x lipat!' });
            
        message.reply({ embeds: [embed] });
    }
};