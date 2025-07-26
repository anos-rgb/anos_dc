const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roulette',
    description: 'Russian Roulette dengan hadiah atau hukuman',
    aliases: ['rou', 'spin'],
    cooldown: 30,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const now = Date.now();
        const lastRoulette = userData.statistik.roulette_terakhir || 0;
        const timeLeft = 30000 - (now - lastRoulette);
        
        if (lastRoulette && timeLeft > 0) {
            const seconds = Math.ceil(timeLeft / 1000);
            return message.reply(`Tunggu ${seconds} detik lagi sebelum main roulette!`);
        }
        
        const member = message.guild.members.cache.get(message.author.id);
        const voiceChannel = member.voice.channel;
        
        const outcomes = [
            { type: 'hadiah', name: 'Jackpot Koin!', value: 750, emoji: '💰' },
            { type: 'hadiah', name: 'Bonus Kecil', value: 250, emoji: '🎁' },
            { type: 'hadiah', name: 'Lucky Day', value: 500, emoji: '🍀' },
            { type: 'hukuman', name: 'Kehilangan Koin', value: -300, emoji: '💸' },
            { type: 'hukuman', name: 'Bad Luck', value: -150, emoji: '😵' },
            { type: 'hukuman', name: 'Bad day', value: -10000, emoji: '😭' },
            { type: 'netral', name: 'Aman', value: 0, emoji: '😐' }
        ];
        
        if (voiceChannel) {
            outcomes.push(
                { type: 'hukuman', name: 'Kick dari VC 10 detik', value: 0, emoji: '🔇', action: 'kick_vc' },
                { type: 'hukuman', name: 'Mute 15 detik', value: 0, emoji: '🔇', action: 'mute_vc' }
            );
        }
        
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        
        userData.saldo += result.value;
        if (userData.saldo < 0) userData.saldo = 0;
        
        userData.statistik.roulette_terakhir = now;
        userData.statistik.command_digunakan++;
        
        client.db.save(client.database);
        
        let color = '#FFFF00';
        if (result.type === 'hadiah') color = '#55FF55';
        if (result.type === 'hukuman') color = '#FF5555';
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🎰 Russian Roulette')
            .setDescription(`${result.emoji} **${result.name}**`)
            .addFields(
                { name: 'Hasil', value: result.value === 0 ? 'Tidak ada perubahan koin' : `${result.value > 0 ? '+' : ''}${result.value} koin`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: 'Berani coba lagi?' });
        
        message.reply({ embeds: [embed] });
        
        if (result.action === 'kick_vc' && voiceChannel) {
            member.voice.disconnect();
            setTimeout(() => {
                if (voiceChannel.joinable) {
                    member.voice.setChannel(voiceChannel).catch(() => {});
                }
            }, 10000);
        }
        
        if (result.action === 'mute_vc' && voiceChannel) {
            member.voice.setMute(true);
            setTimeout(() => {
                member.voice.setMute(false).catch(() => {});
            }, 15000);
        }
    }
};