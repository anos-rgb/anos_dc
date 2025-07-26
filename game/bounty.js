const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bounty',
    description: 'Pasang hadiah untuk target yang berhasil dirampok',
    aliases: ['hadiah'],
    cooldown: 5,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        if (args.length < 2) {
            return message.reply('Format: `/bounty @user amount`');
        }
        
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('Tag user yang mau dikasi bounty!');
        }
        
        if (target.id === message.author.id) {
            return message.reply('Ga bisa kasih bounty ke diri sendiri!');
        }
        
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount < 1000) {
            return message.reply('Minimal bounty 1000 koin!');
        }
        
        if (userData.saldo < amount) {
            return message.reply('Saldo lo ga cukup buat pasang bounty!');
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
        
        userData.saldo -= amount;
        
        if (!client.database.bounties) {
            client.database.bounties = {};
        }
        
        if (client.database.bounties[target.id]) {
            client.database.bounties[target.id] += amount;
        } else {
            client.database.bounties[target.id] = amount;
        }
        
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#FF5555')
            .setTitle('🎯 Bounty Dipasang!')
            .setDescription(`Bounty untuk ${target.username} berhasil dipasang!`)
            .addFields(
                { name: 'Target', value: target.username, inline: true },
                { name: 'Hadiah', value: `${amount} koin`, inline: true },
                { name: 'Total Bounty', value: `${client.database.bounties[target.id]} koin`, inline: true },
                { name: 'Saldo Tersisa', value: `${userData.saldo} koin`, inline: false }
            )
            .setFooter({ text: 'Siapa yang berhasil rampok target ini akan dapat bounty!' });
            
        message.reply({ embeds: [embed] });
    }
};