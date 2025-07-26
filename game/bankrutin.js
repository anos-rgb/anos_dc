const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bankrutin',
    description: 'Bikin target kehilangan 15% koinnya',
    aliases: ['bankrupt', 'ruin'],
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (args.length < 2) {
            return message.reply('Format: `/bankrutin @user biaya` (minimal 100k)');
        }
        
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('Tag user yang mau dibankrutin!');
        }
        
        if (target.id === message.author.id) {
            return message.reply('Ga bisa bankrutin diri sendiri!');
        }
        
        const cost = parseInt(args[1]);
        if (isNaN(cost) || cost < 100000) {
            return message.reply('Minimal biaya bankrutin 100000 koin!');
        }
        
        if (userData.saldo < cost) {
            return message.reply(`Lo butuh ${cost} koin buat bankrutin orang!`);
        }
        
        const now = Date.now();
        const lastBankrupt = userData.statistik.bankrupt_terakhir || 0;
        const timeLeft = 86400000 - (now - lastBankrupt);
        
        if (lastBankrupt && timeLeft > 0) {
            const hours = Math.floor(timeLeft / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);
            return message.reply(`Cooldown bankrutin! Bisa pake lagi dalam ${hours} jam ${minutes} menit.`);
        }
        
        if (!client.database.users[target.id]) {
            client.database.users[target.id] = {
                saldo: 0,
                bank: 0,
                statistik: {
                    command_digunakan: 0,
                    kerja_terakhir: 0,
                    rampok_terakhir: 0,
                    daily_terakhir: 0
                }
            };
        }
        
        const targetData = client.database.users[target.id];
        if (targetData.saldo < 50000) {
            return message.reply('Target udah miskin, ga perlu dibankrutin lagi!');
        }
        
        const lossAmount = Math.floor(targetData.saldo * 0.15);
        const successRate = Math.min(90, 50 + (cost / 10000));
        const success = Math.random() * 100 < successRate;
        
        userData.saldo -= cost;
        userData.statistik.bankrupt_terakhir = now;
        userData.statistik.command_digunakan++;
        
        if (success) {
            targetData.saldo -= lossAmount;
            
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('💥 Bankrutin Berhasil!')
                .setDescription(`${target.username} berhasil dibankrutin!`)
                .addFields(
                    { name: 'Target', value: target.username, inline: true },
                    { name: 'Kehilangan', value: `${lossAmount} koin (15%)`, inline: true },
                    { name: 'Biaya', value: `${cost} koin`, inline: true },
                    { name: 'Success Rate', value: `${successRate.toFixed(1)}%`, inline: true },
                    { name: 'Saldo Tersisa', value: `${userData.saldo} koin`, inline: false }
                )
                .setFooter({ text: 'Target berhasil dibangkrutkan!' });
                
            message.reply({ embeds: [embed] });
            
            setTimeout(() => {
                try {
                    const lossEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('💥 Lo Dibankrutin!')
                        .setDescription(`${message.author.username} berhasil bankrutin lo!`)
                        .addFields(
                            { name: 'Kehilangan', value: `${lossAmount} koin`, inline: true },
                            { name: 'Saldo Sekarang', value: `${targetData.saldo} koin`, inline: true }
                        );
                    target.send({ embeds: [lossEmbed] });
                } catch (e) {
                    console.log('Gagal kirim DM bankrupt');
                }
            }, 1000);
            
        } else {
            const embed = new EmbedBuilder()
                .setColor('#FFAA00')
                .setTitle('💥 Bankrutin Gagal!')
                .setDescription(`Gagal bankrutin ${target.username}!`)
                .addFields(
                    { name: 'Target', value: target.username, inline: true },
                    { name: 'Biaya Terbuang', value: `${cost} koin`, inline: true },
                    { name: 'Success Rate', value: `${successRate.toFixed(1)}%`, inline: true },
                    { name: 'Saldo Tersisa', value: `${userData.saldo} koin`, inline: false }
                )
                .setFooter({ text: 'Coba lagi besok dengan biaya lebih besar!' });
                
            message.reply({ embeds: [embed] });
        }
        
        client.db.save(client.database);
    }
};