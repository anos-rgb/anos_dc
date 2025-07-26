const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'santet',
    description: 'Kurangi 5% saldo target setiap jam selama 3 jam',
    aliases: ['curse'],
    cooldown: 30,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        const cost = 100000;
        
        if (args.length < 1) {
            return message.reply('Format: `/santet @user`');
        }
        
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('Tag user yang mau disantet!');
        }
        
        if (target.id === message.author.id) {
            return message.reply('Ga bisa santet diri sendiri tolol!');
        }
        
        if (userData.saldo < cost) {
            return message.reply(`Lo butuh ${cost} koin buat santet orang!`);
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
        if (targetData.saldo < 10000) {
            return message.reply('Target udah miskin, ga perlu disantet lagi!');
        }
        
        userData.saldo -= cost;
        
        if (!client.database.curses) {
            client.database.curses = {};
        }
        
        const now = Date.now();
        client.database.curses[target.id] = {
            start_time: now,
            end_time: now + (3 * 60 * 60 * 1000),
            last_drain: now,
            caster: message.author.id
        };
        
        userData.statistik.command_digunakan++;
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#800080')
            .setTitle('🔮 Santet Berhasil!')
            .setDescription(`${target.username} kena santet selama 3 jam!`)
            .addFields(
                { name: 'Target', value: target.username, inline: true },
                { name: 'Durasi', value: '3 jam', inline: true },
                { name: 'Efek', value: '-5% saldo/jam', inline: true },
                { name: 'Biaya', value: `${cost} koin`, inline: true },
                { name: 'Saldo Tersisa', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: 'Santet akan menguras saldo target perlahan-lahan...' });
            
        message.reply({ embeds: [embed] });
        
        setTimeout(() => {
            try {
                target.send(`🔮 Lo kena santet! Saldo lo akan berkurang 5% setiap jam selama 3 jam!`);
            } catch (e) {
                console.log('Gagal kirim DM santet');
            }
        }, 1000);
    }
};