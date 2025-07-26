const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'leaderboard',
    description: 'Liat ranking saldo tertinggi',
    aliases: ['lb', 'top', 'rank'],
    cooldown: 10,
    execute(message, args, client) {
        // Pastikan data user sudah ada
        if (!client.database.users || !client.database.users[message.author.id]) {
            return message.reply('Data kamu belum terdaftar, silahkan gunakan command lain terlebih dahulu.');
        }

        const userData = client.database.users[message.author.id];
        
        try {
            // Sort users by saldo
            const sortedUsers = Object.entries(client.database.users)
                .sort((a, b) => b[1].saldo - a[1].saldo)
                .slice(0, 10);
            
            // Format leaderboard
            let leaderboardText = '';
            
            for (let i = 0; i < sortedUsers.length; i++) {
                const userId = sortedUsers[i][0];
                const userSaldo = sortedUsers[i][1].saldo;
                
                // Get user dari cache atau placeholder
                let username;
                const user = client.users.cache.get(userId);
                
                if (user) {
                    username = user.username;
                } else {
                    username = `User #${userId.slice(0, 6)}`;
                }
                
                // Format text dengan nomor, emoji untuk juara 1-3
                const position = i + 1;
                let emoji = '';

                if (position === 1) emoji = '🥇 ';
                else if (position === 2) emoji = '🥈 ';
                else if (position === 3) emoji = '🥉 ';

                leaderboardText += `**${position}.** ${emoji}${username} - **${userSaldo.toLocaleString()}** koin\n`;
            }
            
            // Cari ranking user
            const authorRank = Object.entries(client.database.users)
                .sort((a, b) => b[1].saldo - a[1].saldo)
                .findIndex(user => user[0] === message.author.id) + 1;

            const totalUsers = Object.keys(client.database.users).length;
            
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🏆 Leaderboard Saldo')
                .setDescription(leaderboardText || 'Belum ada data')
                .setFooter({ 
                    text: `Ranking kamu: #${authorRank} dari ${totalUsers} pemain • Saldo: ${userData.saldo.toLocaleString()} koin` 
                })
                .setTimestamp();
                
            message.reply({ embeds: [embed] });
            
            // Tambah counter command digunakan
            if (userData.statistik && userData.statistik.command_digunakan !== undefined) {
                userData.statistik.command_digunakan++;
                // Simpan database
                client.db.save(client.database);
            }
        } catch (error) {
            console.error('Error pada command leaderboard:', error);
            message.reply('Terjadi kesalahan saat menampilkan leaderboard. Coba lagi nanti.');
        }
    }
};