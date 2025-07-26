const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tebaktombol',
    description: 'Tebak tombol untuk menang koin',
    aliases: ['tt', 'tebakin'],
    cooldown: 5,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (!args[0] || isNaN(args[0]) || parseInt(args[0]) < 100) {
            return message.reply('Gunakan: `tebaktombol <taruhan>` (minimal 100 koin)');
        }
        
        const bet = parseInt(args[0]);
        
        if (userData.saldo < bet) {
            return message.reply(`Saldo lo gak cukup! Lo punya ${userData.saldo} koin.`);
        }
        
        const buttons = ['🔴', '🔵', '🟢', '🟡', '🟣'];
        const correctButton = Math.floor(Math.random() * 5);
        
        let description = 'Pilih tombol yang benar!\n\n';
        buttons.forEach((btn, index) => {
            description += `${index + 1}️⃣ ${btn}\n`;
        });
        
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎯 Tebak Tombol')
            .setDescription(description)
            .addFields(
                { name: 'Taruhan', value: `${bet} koin`, inline: true },
                { name: 'Hadiah', value: `${bet * 2} koin`, inline: true }
            )
            .setFooter({ text: 'Ketik angka 1-5 untuk memilih!' });
            
        message.reply({ embeds: [embed] }).then(() => {
            const filter = (m) => m.author.id === message.author.id && ['1', '2', '3', '4', '5'].includes(m.content);
            const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });
            
            collector.on('collect', (m) => {
                const choice = parseInt(m.content) - 1;
                const isWin = choice === correctButton;
                
                if (isWin) {
                    userData.saldo += bet;
                    userData.statistik.command_digunakan++;
                    client.database.statistik_game.koin_beredar += bet;
                    
                    const winEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('🎉 MENANG!')
                        .setDescription(`Benar! Tombol yang tepat adalah ${buttons[correctButton]}`)
                        .addFields(
                            { name: 'Hadiah', value: `+${bet} koin`, inline: true },
                            { name: 'Saldo Baru', value: `${userData.saldo} koin`, inline: true }
                        );
                    m.reply({ embeds: [winEmbed] });
                } else {
                    userData.saldo -= bet;
                    userData.statistik.command_digunakan++;
                    client.database.statistik_game.koin_beredar -= bet;
                    
                    const loseEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('💸 KALAH!')
                        .setDescription(`Salah! Tombol yang benar adalah ${buttons[correctButton]}`)
                        .addFields(
                            { name: 'Kehilangan', value: `-${bet} koin`, inline: true },
                            { name: 'Saldo Baru', value: `${userData.saldo} koin`, inline: true }
                        );
                    m.reply({ embeds: [loseEmbed] });
                }
                
                client.db.save(client.database);
            });
            
            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    message.reply('Waktu habis! Game dibatalkan.');
                }
            });
        });
    }
};