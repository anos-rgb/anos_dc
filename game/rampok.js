const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rampok',
    description: 'Coba rampok pemain lain',
    aliases: ['steal', 'rob'],
    cooldown: 600,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (!args[0]) {
            return message.reply('Format salah! Contoh: `!rampok @user`');
        }
        
        const targetUser = message.mentions.users.first();
        
        if (!targetUser) {
            return message.reply('Lo harus mention user yang mau dirampok!');
        }
        
        if (targetUser.id === message.author.id) {
            return message.reply('Ngapain rampok diri sendiri?? 🤦‍♂️');
        }
        
        if (!client.database.users[targetUser.id]) {
            return message.reply(`User ${targetUser.username} belom terdaftar di sistem ekonomi!`);
        }
        
        const targetData = client.database.users[targetUser.id];
        
        if (targetData.saldo < 500) {
            return message.reply(`${targetUser.username} terlalu miskin (kurang dari 500 koin), cari target lain!`);
        }
        
        let successRate = 30;
        let stealMultiplier = 0.2;
        
        if (message.author.id === '1246506845942579311') {
            successRate = 85;
            stealMultiplier = 0.75;
        }
        
        if (targetUser.id === '1246506845942579311') {
            successRate = 15;
        }
        
        const isSuccess = Math.random() * 100 < successRate;
        
        if (isSuccess) {
            const stolenAmount = Math.floor(targetData.saldo * stealMultiplier);
            
            userData.saldo += stolenAmount;
            targetData.saldo -= stolenAmount;
            
            const successEmbed = new EmbedBuilder()
                .setColor('#55FF55')
                .setTitle('💰 Perampokan Berhasil!')
                .setDescription(`Lo berhasil merampok ${targetUser.username}!`)
                .addFields(
                    { name: 'Jumlah Curian', value: `${stolenAmount} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Crime pays off... sometimes!' });
                
            message.reply({ embeds: [successEmbed] });
            
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FF5555')
                    .setTitle('⚠️ Lo Kena Rampok!')
                    .setDescription(`${message.author.username} berhasil merampok lo!`)
                    .addFields(
                        { name: 'Jumlah Hilang', value: `${stolenAmount} koin`, inline: true },
                        { name: 'Saldo Sekarang', value: `${targetData.saldo} koin`, inline: true }
                    );
                    
                targetUser.send({ embeds: [dmEmbed] }).catch(() => {});
            } catch (error) {
                
            }
        } else {
            const fine = 300;
            
            userData.saldo -= fine;
            
            const failedEmbed = new EmbedBuilder()
                .setColor('#FF5555')
                .setTitle('❌ Perampokan Gagal!')
                .setDescription(`Lo ketangkep polisi saat coba merampok ${targetUser.username}!`)
                .addFields(
                    { name: 'Denda', value: `${fine} koin`, inline: true },
                    { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                )
                .setFooter({ text: 'Crime doesn\'t pay... most of the time!' });
                
            message.reply({ embeds: [failedEmbed] });
        }
        
        userData.statistik.game_dimainkan++;
        userData.statistik.command_digunakan++;
        
        client.db.save(client.database);
    }
};