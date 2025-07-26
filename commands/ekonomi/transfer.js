const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tf',
    description: 'Transfer koin ke user lain',
    aliases: ['pay', 'kirim', 'transfer'],
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (!args[0] || !args[1]) {
            return message.reply('Format salah bro! Contoh: `!transfer @user 100`');
        }
        
        const targetUser = message.mentions.users.first();
        
        if (!targetUser) {
            return message.reply('Lo harus mention user yang mau ditransfer!');
        }
        
        if (targetUser.id === message.author.id) {
            return message.reply('Ngapain transfer ke diri sendiri?? 🤦‍♂️');
        }
        
        if (!client.database.users[targetUser.id]) {
            return message.reply(`User ${targetUser.username} belom terdaftar di sistem ekonomi!`);
        }
        
        const amount = parseInt(args[1]);
        
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Jumlah transfer harus berupa angka positif!');
        }
        
        if (!client.database.pajak) client.database.pajak = 5;
        
        const pajakAmount = Math.floor(amount * client.database.pajak / 100);
        const totalDeduct = amount + pajakAmount;
        
        if (userData.saldo < totalDeduct) {
            return message.reply(`Saldo lo cuma ${userData.saldo} koin, ga cukup buat transfer ${amount} + pajak ${pajakAmount} = ${totalDeduct} koin!`);
        }
        
        userData.saldo -= totalDeduct;
        client.database.users[targetUser.id].saldo += amount;
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#55FF55')
            .setTitle('💸 Transfer Berhasil!')
            .setDescription(`Lo berhasil transfer koin ke ${targetUser.username}`)
            .addFields(
                { name: 'Jumlah Transfer', value: `${amount} koin`, inline: true },
                { name: 'Pajak (' + client.database.pajak + '%)', value: `${pajakAmount} koin`, inline: true },
                { name: 'Total Dipotong', value: `${totalDeduct} koin`, inline: true },
                { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: 'Transfer selesai dengan pajak!' });
            
        message.reply({ embeds: [embed] });
        
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
    }
};