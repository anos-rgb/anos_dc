const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'msuit',
    description: 'Main suit dengan pemain lain untuk dapat koin',
    aliases: ['mrps', 'mrockpaperscissors'],
    cooldown: 5,
    execute(message, args, client) {
        if (!args[0]) {
            return message.reply('Tag pemain yang mau lo tantang! Contoh: `!suit @username`');
        }

        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('Tag pemain yang valid dong!');
        }

        if (target.id === message.author.id) {
            return message.reply('Ga bisa main sama diri sendiri anjay!');
        }

        if (target.bot) {
            return message.reply('Ga bisa main sama bot!');
        }

        const challenger = message.author;
        const userData1 = client.database.users[challenger.id];
        const userData2 = client.database.users[target.id];

        if (userData1.saldo < 100) {
            return message.reply('Lo butuh minimal 100 koin buat main suit!');
        }

        if (userData2.saldo < 100) {
            return message.reply('Target lo ga punya koin cukup buat main (minimal 100)!');
        }

        const gameData = {
            challenger: challenger.id,
            target: target.id,
            challengerChoice: null,
            targetChoice: null,
            bet: 100,
            timeout: null
        };

        const choices = [
            { emoji: '🪨', name: 'Batu', value: 'rock' },
            { emoji: '📄', name: 'Kertas', value: 'paper' },
            { emoji: '✂️', name: 'Gunting', value: 'scissors' }
        ];

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('suit_rock')
                    .setLabel('Batu')
                    .setEmoji('🪨')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('suit_paper')
                    .setLabel('Kertas')
                    .setEmoji('📄')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('suit_scissors')
                    .setLabel('Gunting')
                    .setEmoji('✂️')
                    .setStyle(ButtonStyle.Secondary)
            );

        const embed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('⚔️ Tantangan Suit!')
            .setDescription(`${challenger} menantang ${target} main suit!\n\n💰 **Taruhan:** 100 koin\n⏰ **Waktu:** 30 detik`)
            .addFields(
                { name: '📋 Cara Main', value: 'Kedua pemain pilih pilihan dengan klik tombol di bawah!' },
                { name: '🏆 Menang', value: 'Pemenang dapet 180 koin (taruhan 200 - fee 20)' }
            )
            .setFooter({ text: 'Game otomatis dibatal jika ada yang ga milih dalam 30 detik' });

        message.reply({ embeds: [embed], components: [row] }).then(gameMessage => {
            const filter = (interaction) => {
                return ['suit_rock', 'suit_paper', 'suit_scissors'].includes(interaction.customId) &&
                       [challenger.id, target.id].includes(interaction.user.id);
            };

            const collector = gameMessage.createMessageComponentCollector({ 
                filter, 
                time: 30000 
            });

            gameData.timeout = setTimeout(() => {
                collector.stop('timeout');
            }, 30000);

            collector.on('collect', async (interaction) => {
                const playerId = interaction.user.id;
                const choice = interaction.customId.split('_')[1];

                if (playerId === gameData.challenger && !gameData.challengerChoice) {
                    gameData.challengerChoice = choice;
                    await interaction.reply({ content: 'Pilihan lo udah dicatat! Tunggu lawan...', ephemeral: true });
                } else if (playerId === gameData.target && !gameData.targetChoice) {
                    gameData.targetChoice = choice;
                    await interaction.reply({ content: 'Pilihan lo udah dicatat! Tunggu lawan...', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Lo udah milih atau bukan giliran lo!', ephemeral: true });
                    return;
                }

                if (gameData.challengerChoice && gameData.targetChoice) {
                    collector.stop('finished');
                }
            });

            collector.on('end', (collected, reason) => {
                clearTimeout(gameData.timeout);

                if (reason === 'timeout') {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('⏰ Game Timeout!')
                        .setDescription('Game dibatal karena ada yang ga milih dalam waktu 30 detik.')
                        .setFooter({ text: 'Coba lagi nanti!' });

                    gameMessage.edit({ embeds: [timeoutEmbed], components: [] });
                    return;
                }

                if (!gameData.challengerChoice || !gameData.targetChoice) {
                    const cancelEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Game Dibatal')
                        .setDescription('Game dibatal karena ada pemain yang ga milih.')
                        .setFooter({ text: 'Coba lagi nanti!' });

                    gameMessage.edit({ embeds: [cancelEmbed], components: [] });
                    return;
                }

                const challengerChoiceData = choices.find(c => c.value === gameData.challengerChoice);
                const targetChoiceData = choices.find(c => c.value === gameData.targetChoice);

                let winner = null;
                let result = '';

                if (gameData.challengerChoice === gameData.targetChoice) {
                    result = 'Seri! Ga ada yang menang.';
                } else if (
                    (gameData.challengerChoice === 'rock' && gameData.targetChoice === 'scissors') ||
                    (gameData.challengerChoice === 'paper' && gameData.targetChoice === 'rock') ||
                    (gameData.challengerChoice === 'scissors' && gameData.targetChoice === 'paper')
                ) {
                    winner = challenger;
                    result = `${challenger} menang!`;
                    client.database.users[challenger.id].saldo += 80;
                    client.database.users[target.id].saldo -= 100;
                } else {
                    winner = target;
                    result = `${target} menang!`;
                    client.database.users[target.id].saldo += 80;
                    client.database.users[challenger.id].saldo -= 100;
                }

                client.database.users[challenger.id].statistik.command_digunakan++;
                client.database.users[target.id].statistik.command_digunakan++;

                if (winner) {
                    client.database.statistik_game.penghasilan_harian += 20;
                }

                client.db.save(client.database);

                const resultEmbed = new EmbedBuilder()
                    .setColor(winner ? '#00FF00' : '#FFFF00')
                    .setTitle('🎮 Hasil Suit')
                    .setDescription(result)
                    .addFields(
                        { 
                            name: `${challengerChoiceData.emoji} ${challenger.username}`, 
                            value: challengerChoiceData.name, 
                            inline: true 
                        },
                        { 
                            name: 'VS', 
                            value: '⚔️', 
                            inline: true 
                        },
                        { 
                            name: `${targetChoiceData.emoji} ${target.username}`, 
                            value: targetChoiceData.name, 
                            inline: true 
                        }
                    )
                    .setFooter({ 
                        text: winner ? `${winner.username} dapet 80 koin! (Fee: 20 koin)` : 'Ga ada yang kalah koin!' 
                    });

                gameMessage.edit({ embeds: [resultEmbed], components: [] });
            });
        });
    }
};