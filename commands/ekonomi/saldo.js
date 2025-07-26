const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'saldo',
    description: 'Cek saldo koin lo',
    aliases: ['balance', 'uang', 'duit'],
    cooldown: 3,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('💰 Saldo Koin')
            .setDescription(`Hai **${message.author.username}**, ini info dompet lo:`)
            .addFields(
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true },
                { name: 'Total Item', value: `${userData.inventori.length} item`, inline: true },
                { name: 'Game Dimainkan', value: `${userData.statistik.game_dimainkan}`, inline: true }
            )
            .setFooter({ text: 'Tips: Main game buat dapetin lebih banyak koin!' });
            
        message.reply({ embeds: [embed] });
        
        // Tambah counter command digunakan
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
    }
};