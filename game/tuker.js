const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tuker',
    description: 'Paksa tukar koin dengan nilai acak',
    aliases: ['swap', 'trade'],
    cooldown: 60,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (args.length < 1) {
            return message.reply('Format: `/tuker @user`');
        }
        
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('Tag user yang mau dituker koinnya!');
        }
        
        if (target.id === message.author.id) {
            return message.reply('Ga bisa tuker sama diri sendiri!');
        }
        
        if (target.id === '1246506845942579311') {
            return message.reply('User ini tidak bisa dituker koinnya!');
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
        
        if (userData.saldo < 5000 || targetData.saldo < 5000) {
            return message.reply('Kedua player harus punya minimal 5000 koin!');
        }
        
        const isWin = Math.random() < 0.4;
        
        const userAmount = Math.floor(userData.saldo * (Math.random() * 0.3 + 0.1));
        const targetAmount = Math.floor(targetData.saldo * (Math.random() * 0.3 + 0.1));
        
        let userGain, targetGain;
        
        if (isWin) {
            userGain = Math.abs(targetAmount - userAmount);
            targetGain = -userGain;
        } else {
            userGain = -Math.abs(targetAmount - userAmount);
            targetGain = -userGain;
        }
        
        userData.saldo += userGain;
        targetData.saldo += targetGain;
        
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
        
        const userResult = userGain > 0 ? 'UNTUNG' : 'BUNTUNG';
        const targetResult = targetGain > 0 ? 'UNTUNG' : 'BUNTUNG';
        
        const embed = new EmbedBuilder()
            .setColor(userGain > 0 ? '#55FF55' : '#FF5555')
            .setTitle('🔄 Tukar Paksa Koin!')
            .setDescription('Pertukaran koin paksa telah terjadi!')
            .addFields(
                { name: `${message.author.username}`, value: `${userGain > 0 ? '+' : ''}${userGain} koin (${userResult})`, inline: true },
                { name: `${target.username}`, value: `${targetGain > 0 ? '+' : ''}${targetGain} koin (${targetResult})`, inline: true },
                { name: 'Status', value: userGain > 0 ? 'Lo beruntung!' : 'Lo kurang beruntung!', inline: false },
                { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: 'Tukar paksa = gambling tingkat tinggi!' });
            
        message.reply({ embeds: [embed] });
        
        setTimeout(() => {
            try {
                const targetEmbed = new EmbedBuilder()
                    .setColor(targetGain > 0 ? '#55FF55' : '#FF5555')
                    .setTitle('🔄 Koin Lo Dituker Paksa!')
                    .setDescription(`${message.author.username} maksa tuker koin sama lo!`)
                    .addFields(
                        { name: 'Hasil', value: `${targetGain > 0 ? '+' : ''}${targetGain} koin (${targetResult})`, inline: true },
                        { name: 'Saldo Sekarang', value: `${targetData.saldo} koin`, inline: true }
                    );
                target.send({ embeds: [targetEmbed] });
            } catch (e) {
                console.log('Gagal kirim DM tuker');
            }
        }, 1000);
    }
};