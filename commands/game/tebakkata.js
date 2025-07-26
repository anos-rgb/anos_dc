const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tebakkata',
    description: 'Main game Word Chain (tebak kata berantai)',
    aliases: ['wordchain', 'kata-berantai', 'chain'],
    cooldown: 3,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        // Inisialisasi game data jika belum ada
        if (!client.gameData) {
            client.gameData = {};
        }
        
        const channelId = message.channel.id;
        
        // Cek apakah game sudah berjalan di channel ini
        if (client.gameData[channelId] && client.gameData[channelId].active) {
            return message.reply('Game Word Chain sudah berjalan di channel ini! Ketik kata yang dimulai dengan huruf terakhir dari kata sebelumnya.');
        }
        
        // Daftar kata awal untuk memulai game
        const startWords = [
            'anos', 'buku', 'cinta', 'dunia', 'elang', 'fiksi', 'gajah', 'harum',
            'indah', 'jeruk', 'kucing', 'langit', 'malam', 'naga', 'orang', 'pagi',
            'queen', 'rumah', 'senja', 'tanah', 'udara', 'villa', 'warna', 'xerus',
            'yakult', 'zebra', 'angin', 'bambu', 'cepat', 'daun', 'emas', 'fajar'
        ];
        
        // Pilih kata awal secara random
        const startWord = startWords[Math.floor(Math.random() * startWords.length)];
        const lastLetter = startWord.slice(-1).toLowerCase();
        
        // Inisialisasi game state
        client.gameData[channelId] = {
            active: true,
            currentWord: startWord,
            lastLetter: lastLetter,
            usedWords: [startWord.toLowerCase()],
            players: {},
            startTime: Date.now(),
            timeout: null
        };
        
        // Set timeout untuk menghentikan game jika tidak ada yang menjawab (60 detik)
        client.gameData[channelId].timeout = setTimeout(() => {
            if (client.gameData[channelId] && client.gameData[channelId].active) {
                endGame(channelId, client, message.channel, 'timeout');
            }
        }, 60000);
        
        // Embed untuk memulai game
        const startEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎯 Word Chain Game Dimulai!')
            .setDescription(`**Kata pertama:** ${startWord}\n\nSebutkan kata yang dimulai dengan huruf **"${lastLetter.toUpperCase()}"**!`)
            .addFields(
                { name: '📋 Aturan:', value: '• Kata harus dimulai dengan huruf terakhir dari kata sebelumnya\n• Tidak boleh mengulang kata yang sudah digunakan\n• Waktu berpikir maksimal 60 detik\n• Minimal 3 huruf', inline: false },
                { name: '🏆 Hadiah:', value: '50-150 koin per kata yang benar', inline: false }
            )
            .setFooter({ text: 'Ketik kata di chat untuk bermain!' });
            
        message.reply({ embeds: [startEmbed] });
        
        // Event listener untuk menangkap jawaban
        const filter = (msg) => {
            return !msg.author.bot && msg.channel.id === channelId && client.gameData[channelId] && client.gameData[channelId].active;
        };
        
        const collector = message.channel.createMessageCollector({ filter, time: 300000 }); // 5 menit max
        
        collector.on('collect', (msg) => {
            handleWordChainAnswer(msg, client);
        });
        
        collector.on('end', () => {
            if (client.gameData[channelId] && client.gameData[channelId].active) {
                endGame(channelId, client, message.channel, 'time_up');
            }
        });
    }
};

function handleWordChainAnswer(message, client) {
    const channelId = message.channel.id;
    const gameData = client.gameData[channelId];
    
    if (!gameData || !gameData.active) return;
    
    const answer = message.content.toLowerCase().trim();
    const userId = message.author.id;
    const userData = client.database.users[userId];
    
    // Validasi jawaban
    if (answer.length < 3) {
        return message.react('❌');
    }
    
    // Cek apakah dimulai dengan huruf yang benar
    if (!answer.startsWith(gameData.lastLetter)) {
        return message.reply(`❌ Kata harus dimulai dengan huruf **"${gameData.lastLetter.toUpperCase()}"**!`);
    }
    
    // Cek apakah kata sudah digunakan
    if (gameData.usedWords.includes(answer)) {
        return message.reply('❌ Kata ini sudah digunakan sebelumnya!');
    }
    
    // Jawaban benar!
    message.react('✅');
    
    // Reset timeout
    if (gameData.timeout) {
        clearTimeout(gameData.timeout);
    }
    
    // Update game state
    const newLastLetter = answer.slice(-1).toLowerCase();
    gameData.currentWord = answer;
    gameData.lastLetter = newLastLetter;
    gameData.usedWords.push(answer);
    
    // Update player stats
    if (!gameData.players[userId]) {
        gameData.players[userId] = {
            username: message.author.username,
            correct: 0,
            earnings: 0
        };
    }
    
    gameData.players[userId].correct++;
    
    // Hitung reward
    const baseReward = 50;
    const bonus = Math.floor(Math.random() * 101); // 0-100
    const totalReward = baseReward + bonus;
    
    gameData.players[userId].earnings += totalReward;
    userData.saldo += totalReward;
    userData.statistik.command_digunakan++;
    
    // Update statistik server
    client.database.statistik_game.penghasilan_harian += totalReward;
    
    // Simpan database
    client.db.save(client.database);
    
    // Kirim info word selanjutnya
    const nextEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Benar!')
        .setDescription(`**${message.author.username}** mendapat **${totalReward} koin**!\n\n**Kata selanjutnya harus dimulai dengan: "${newLastLetter.toUpperCase()}"**`)
        .addFields(
            { name: 'Kata sekarang', value: answer, inline: true },
            { name: 'Kata yang digunakan', value: `${gameData.usedWords.length} kata`, inline: true }
        )
        .setFooter({ text: 'Waktu berpikir: 60 detik' });
        
    message.reply({ embeds: [nextEmbed] });
    
    // Set timeout baru
    gameData.timeout = setTimeout(() => {
        if (client.gameData[channelId] && client.gameData[channelId].active) {
            endGame(channelId, client, message.channel, 'timeout');
        }
    }, 60000);
}

function endGame(channelId, client, channel, reason) {
    const gameData = client.gameData[channelId];
    
    if (!gameData) return;
    
    // Clear timeout
    if (gameData.timeout) {
        clearTimeout(gameData.timeout);
    }
    
    // Mark game as inactive
    gameData.active = false;
    
    // Hitung statistik
    const totalWords = gameData.usedWords.length;
    const playerCount = Object.keys(gameData.players).length;
    
    // Buat leaderboard
    const sortedPlayers = Object.entries(gameData.players)
        .sort(([,a], [,b]) => b.correct - a.correct)
        .slice(0, 5);
    
    let leaderboard = '';
    if (sortedPlayers.length > 0) {
        sortedPlayers.forEach(([userId, data], index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            leaderboard += `${medal} **${data.username}**: ${data.correct} kata (${data.earnings} koin)\n`;
        });
    } else {
        leaderboard = 'Tidak ada yang berpartisipasi 😢';
    }
    
    // Tentukan pesan berdasarkan alasan berakhir
    let endMessage;
    switch (reason) {
        case 'timeout':
            endMessage = '⏰ Game berakhir karena tidak ada yang menjawab dalam 60 detik!';
            break;
        case 'time_up':
            endMessage = '⏰ Waktu game habis!';
            break;
        default:
            endMessage = '🎯 Game Word Chain berakhir!';
    }
    
    // Embed hasil akhir
    const endEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('🏁 Game Word Chain Berakhir!')
        .setDescription(endMessage)
        .addFields(
            { name: '📊 Statistik Game', value: `Total kata: ${totalWords}\nPemain: ${playerCount}`, inline: true },
            { name: '🏆 Leaderboard', value: leaderboard, inline: false }
        )
        .setFooter({ text: 'Ketik /tebak-kata untuk main lagi!' });
        
    channel.send({ embeds: [endEmbed] });
    
    // Cleanup
    delete client.gameData[channelId];
}