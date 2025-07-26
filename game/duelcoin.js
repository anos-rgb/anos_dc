const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'duelcoin',
    description: 'Duel coin flip dengan member lain',
    aliases: ['duel', 'coinflip'],
    cooldown: 10,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (!args[0] || !args[1] || isNaN(args[1]) || parseInt(args[1]) < 200) {
            return message.reply('Gunakan: `duelcoin <@user> <taruhan>` (minimal 200 koin)');
        }
        
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('Tag user yang mau lo tantang!');
        }
        
        if (target.id === message.author.id) {
            return message.reply('Lo gak bisa duel sama diri sendiri!');
        }
        
        if (target.bot) {
            return message.reply('Gak bisa duel sama bot!');
        }
        
        const bet = parseInt(args[1]);
        const targetData = client.database.users[target.id];
        
        if (userData.saldo < bet) {
            return message.reply(`Saldo lo gak cukup! Lo punya ${userData.saldo} koin.`);
        }
        
        if (targetData.saldo < bet) {
            return message.reply(`Saldo ${target.username} gak cukup! Mereka punya ${targetData.saldo} koin.`);
        }
        
        const challengeEmbed = new EmbedBuilder()
            .setColor('#FF6B35')
            .setTitle('⚔️ Tantangan Duel Coin!')
            .setDescription(`${message.author} menantang ${target} duel coin flip!`)
            .addFields(
                { name: 'Taruhan', value: `${bet} koin`, inline: true },
                { name: 'Hadiah Pemenang', value: `${bet * 2} koin`, inline: true }
            )
            .setFooter({ text: 'Klik tombol untuk terima atau tolak (30 detik)' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('duel_accept')
                    .setLabel('✅ Terima')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('duel_decline')
                    .setLabel('❌ Tolak')
                    .setStyle(ButtonStyle.Danger)
            );
            
        message.reply({ content: `${target}`, embeds: [challengeEmbed], components: [row] }).then(async (msg) => {
            const filter = (interaction) => {
                return interaction.customId.startsWith('duel_') && interaction.user.id === target.id;
            };
            
            const collector = msg.createMessageComponentCollector({ filter, time: 30000, max: 1 });
            
            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'duel_decline') {
                    const declineEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Tantangan Ditolak')
                        .setDescription(`${target} menolak tantangan duel dari ${message.author}`);
                    return await interaction.update({ embeds: [declineEmbed], components: [] });
                }
                
                const duelEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🪙 Duel Coin Flip Dimulai!')
                    .setDescription('Koin sedang dilempar...')
                    .addFields({ name: 'Taruhan', value: `${bet} koin per orang`, inline: true });
                
                await interaction.update({ embeds: [duelEmbed], components: [] });
                
                setTimeout(() => {
                    const winner = Math.random() < 0.5 ? message.author : target;
                    const loser = winner.id === message.author.id ? target : message.author;
                    const winnerData = client.database.users[winner.id];
                    const loserData = client.database.users[loser.id];
                    
                    winnerData.saldo += bet;
                    loserData.saldo -= bet;
                    
                    winnerData.statistik.command_digunakan++;
                    loserData.statistik.command_digunakan++;
                    
                    const resultEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('🎉 Hasil Duel Coin!')
                        .setDescription(`**Pemenang:** ${winner}\n**Pecundang:** ${loser}`)
                        .addFields(
                            { name: 'Hadiah', value: `${bet} koin`, inline: true },
                            { name: `Saldo ${winner.username}`, value: `${winnerData.saldo} koin`, inline: true },
                            { name: `Saldo ${loser.username}`, value: `${loserData.saldo} koin`, inline: true }
                        );
                    
                    msg.edit({ embeds: [resultEmbed], components: [] });
                    client.db.save(client.database);
                }, 3000);
            });
            
            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#808080')
                        .setTitle('⏰ Waktu Habis')
                        .setDescription('Tantangan duel berakhir karena tidak ada respon.');
                    msg.edit({ embeds: [timeoutEmbed], components: [] });
                }
            });
        });
    }
};