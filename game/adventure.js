const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'adventure',
    description: 'Pergi petualangan untuk cari harta karun',
    aliases: ['petualangan', 'explore'],
    cooldown: 40,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const locations = [
            { name: 'Gua Misterius', emoji: '🕳️', danger: 0.3 },
            { name: 'Hutan Terlarang', emoji: '🌲', danger: 0.4 },
            { name: 'Kastil Tua', emoji: '🏰', danger: 0.5 },
            { name: 'Piramida Mesir', emoji: '🏛️', danger: 0.6 },
            { name: 'Pulau Terpencil', emoji: '🏝️', danger: 0.2 },
            { name: 'Pegunungan Tinggi', emoji: '⛰️', danger: 0.45 }
        ];
        
        const treasures = [
            { name: 'Koin Emas', emoji: '🪙', value: 800 },
            { name: 'Permata Merah', emoji: '💎', value: 1200 },
            { name: 'Pedang Antik', emoji: '⚔️', value: 1000 },
            { name: 'Kalung Berlian', emoji: '💍', value: 1500 },
            { name: 'Mahkota Raja', emoji: '👑', value: 2000 },
            { name: 'Scroll Kuno', emoji: '📜', value: 600 }
        ];
        
        const location = locations[Math.floor(Math.random() * locations.length)];
        const treasure = treasures[Math.floor(Math.random() * treasures.length)];
        
        const survivalChance = Math.random();
        const isDangerous = survivalChance < location.danger;
        
        if (isDangerous) {
            const penalty = Math.floor(userData.saldo * 0.1);
            userData.saldo = Math.max(0, userData.saldo - penalty);
            userData.statistik.command_digunakan++;
            
            client.db.save(client.database);
            
            const embed = new EmbedBuilder()
                .setColor('#FF4757')
                .setTitle('☠️ Petualangan Gagal!')
                .setDescription(`Lo terjebak di ${location.emoji} ${location.name} dan kehilangan ${penalty} koin!`)
                .addFields(
                    { name: 'Lokasi', value: `${location.emoji} ${location.name}`, inline: true },
                    { name: 'Kehilangan', value: `${penalty} koin`, inline: true },
                    { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Hati-hati next time!' });
                
            return message.reply({ embeds: [embed] });
        }
        
        const luckMultiplier = Math.random() < 0.1 ? 2 : 1;
        const finalReward = treasure.value * luckMultiplier;
        
        userData.saldo += finalReward;
        userData.statistik.command_digunakan++;
        client.database.statistik_game.penghasilan_harian += finalReward;
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('🗺️ Petualangan Sukses!')
            .setDescription(`Lo menemukan ${treasure.emoji} ${treasure.name} di ${location.emoji} ${location.name}!`)
            .addFields(
                { name: 'Lokasi', value: `${location.emoji} ${location.name}`, inline: true },
                { name: 'Harta', value: `${treasure.emoji} ${treasure.name}`, inline: true },
                { name: 'Nilai', value: `${finalReward} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: luckMultiplier > 1 ? '🍀 Double treasure! Lucky you!' : 'Selamat berpetualang!' });
            
        message.reply({ embeds: [embed] });
    }
};