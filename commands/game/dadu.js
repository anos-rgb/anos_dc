const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dadu',
    description: 'Lempar dadu dengan taruhan',
    aliases: ['dice', 'roll'],
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (!args[0] || !args[1]) {
            return message.reply('Format: `!dadu <1-6> <jumlah_taruhan>`');
        }
        
        const tebakan = parseInt(args[0]);
        const taruhan = parseInt(args[1]);
        
        if (isNaN(tebakan) || tebakan < 1 || tebakan > 6) {
            return message.reply('Tebakan harus angka 1-6!');
        }
        
        if (isNaN(taruhan) || taruhan <= 0) {
            return message.reply('Jumlah taruhan harus berupa angka positif!');
        }
        
        if (userData.saldo < taruhan) {
            return message.reply(`Saldo lo gak cukup! Saldo sekarang: ${userData.saldo} koin`);
        }
        
        const hasil = Math.floor(Math.random() * 6) + 1;
        
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const diceEmoji = diceEmojis[hasil - 1];
        
        let kemenangan = 0;
        let status = '';
        
        if (hasil === tebakan) {
            kemenangan = taruhan * 5;
            status = '🎯 TEPAT SASARAN!';
            userData.saldo += kemenangan;
        } else if (Math.abs(hasil - tebakan) === 1) {
            kemenangan = Math.floor(taruhan * 0.5);
            status = '📍 HAMPIR TEPAT!';
            userData.saldo += kemenangan;
        } else {
            kemenangan = -taruhan;
            status = '❌ MELESET JAUH!';
            userData.saldo -= taruhan;
        }
        
        userData.statistik.command_digunakan++;
        
        if (kemenangan > 0) {
            client.database.statistik_game.penghasilan_harian += kemenangan;
        }
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor(kemenangan > 0 ? '#55FF55' : kemenangan === 0 ? '#FFFF55' : '#FF5555')
            .setTitle('🎲 Dadu')
            .setDescription(`Dadu menunjukkan: ${diceEmoji} **${hasil}**`)
            .addFields(
                { name: 'Tebakan Lo', value: tebakan.toString(), inline: true },
                { name: 'Hasil Dadu', value: hasil.toString(), inline: true },
                { name: 'Status', value: status, inline: true },
                { name: 'Taruhan', value: `${taruhan} koin`, inline: true },
                { name: kemenangan > 0 ? 'Dapat' : 'Kehilangan', value: `${Math.abs(kemenangan)} koin`, inline: true },
                { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
            )
            .addFields({
                name: 'Info Hadiah',
                value: '🎯 Tepat = 5x taruhan\n📍 Selisih 1 = 0.5x taruhan\n❌ Lainnya = Kehilangan taruhan',
                inline: false
            })
            .setFooter({ text: kemenangan > 0 ? 'Lucky strike!' : 'Coba tebak lagi!' });
            
        message.reply({ embeds: [embed] });
    }
};