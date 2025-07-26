const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'suit',
    description: 'Main suit dengan bot untuk menang koin',
    aliases: ['rps', 'gunting'],
    cooldown: 5,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (!args[0] || isNaN(args[0]) || parseInt(args[0]) < 50) {
            return message.reply('Gunakan: `suit <taruhan>` (minimal 50 koin)');
        }
        
        const bet = parseInt(args[0]);
        
        if (userData.saldo < bet) {
            return message.reply(`Saldo lo gak cukup! Lo punya ${userData.saldo} koin.`);
        }
        
        const choices = ['🗿', '📄', '✂️'];
        const choiceNames = ['Batu', 'Kertas', 'Gunting'];
        
        const embed = new EmbedBuilder()
            .setColor('#4169E1')
            .setTitle('✋ Suit (Batu Gunting Kertas)')
            .setDescription('Pilih pilihanmu!')
            .addFields(
                { name: 'Taruhan', value: `${bet} koin`, inline: true },
                { name: 'Hadiah Menang', value: `${Math.floor(bet * 0.37)} koin`, inline: true }
            )
            .setFooter({ text: 'Klik tombol untuk memilih!' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('suit_batu')
                    .setLabel('🗿 Batu')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('suit_kertas')
                    .setLabel('📄 Kertas')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('suit_gunting')
                    .setLabel('✂️ Gunting')
                    .setStyle(ButtonStyle.Primary)
            );
            
        message.reply({ embeds: [embed], components: [row] }).then(async (msg) => {
            const filter = (interaction) => {
                return interaction.customId.startsWith('suit_') && interaction.user.id === message.author.id;
            };
            
            const collector = msg.createMessageComponentCollector({ filter, time: 30000, max: 1 });
            
            collector.on('collect', async (interaction) => {
                let userChoice;
                if (interaction.customId === 'suit_batu') userChoice = 0;
                else if (interaction.customId === 'suit_kertas') userChoice = 1;
                else if (interaction.customId === 'suit_gunting') userChoice = 2;
                
                const botChoice = Math.floor(Math.random() * 3);
                
                let result;
                let resultText;
                let color;
                
                if (userChoice === botChoice) {
                    result = 'draw';
                    resultText = 'SERI!';
                    color = '#FFFF00';
                } else if (
                    (userChoice === 0 && botChoice === 2) ||
                    (userChoice === 1 && botChoice === 0) ||
                    (userChoice === 2 && botChoice === 1)
                ) {
                    result = 'win';
                    resultText = 'MENANG!';
                    color = '#00FF00';
                    const winAmount = Math.floor(bet * 0.37);
                    userData.saldo += winAmount;
                    client.database.statistik_game.koin_beredar += winAmount;
                } else {
                    result = 'lose';
                    resultText = 'KALAH!';
                    color = '#FF0000';
                    userData.saldo -= bet;
                    client.database.statistik_game.koin_beredar -= bet;
                }
                
                userData.statistik.command_digunakan++;
                
                const resultEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(`🎮 ${resultText}`)
                    .addFields(
                        { name: 'Pilihan Lo', value: `${choices[userChoice]} ${choiceNames[userChoice]}`, inline: true },
                        { name: 'Pilihan Bot', value: `${choices[botChoice]} ${choiceNames[botChoice]}`, inline: true },
                        { name: 'Saldo Baru', value: `${userData.saldo} koin`, inline: false }
                    );
                
                if (result === 'win') {
                    resultEmbed.addFields({ name: 'Hadiah', value: `+${Math.floor(bet * 0.37)} koin`, inline: true });
                } else if (result === 'lose') {
                    resultEmbed.addFields({ name: 'Kehilangan', value: `-${bet} koin`, inline: true });
                }
                
                await interaction.update({ embeds: [resultEmbed], components: [] });
                client.db.save(client.database);
            });
            
            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    msg.edit({ content: 'Waktu habis! Game dibatalkan.', embeds: [], components: [] });
                }
            });
        });
    }
};