const { EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const DATABASE_PATH = path.join(__dirname, '..', 'data', 'messages.json');
const DAILY_DATABASE_PATH = path.join(__dirname, '..', 'data', 'daily_messages.json');

async function loadDatabase(dbPath = DATABASE_PATH) {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function saveDatabase(data, dbPath = DATABASE_PATH) {
    try {
        const dir = path.dirname(dbPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error menyimpan database:', error);
    }
}

async function updateMessageCount(userId, guildId) {
    const database = await loadDatabase();
    const dailyDatabase = await loadDatabase(DAILY_DATABASE_PATH);
    
    if (!database[guildId]) {
        database[guildId] = {};
    }
    if (!dailyDatabase[guildId]) {
        dailyDatabase[guildId] = {};
    }
    
    if (!database[guildId][userId]) {
        database[guildId][userId] = { count: 0, lastUpdated: new Date().toISOString() };
    }
    if (!dailyDatabase[guildId][userId]) {
        dailyDatabase[guildId][userId] = { count: 0, lastUpdated: new Date().toISOString() };
    }
    
    database[guildId][userId].count++;
    database[guildId][userId].lastUpdated = new Date().toISOString();
    
    dailyDatabase[guildId][userId].count++;
    dailyDatabase[guildId][userId].lastUpdated = new Date().toISOString();
    
    await saveDatabase(database);
    await saveDatabase(dailyDatabase, DAILY_DATABASE_PATH);
}

async function resetDailyStats(guildId) {
    const database = await loadDatabase();
    
    if (database[guildId]) {
        for (const userId in database[guildId]) {
            database[guildId][userId].count = 0;
        }
        await saveDatabase(database);
    }
}

module.exports = {
    name: 'topmem',
    description: 'Tampilkan top 10 member berdasarkan jumlah pesan dari semua channel',
    
    async execute(message) {
        try {
            const database = await loadDatabase();
            const guildData = database[message.guild.id] || {};
            
            if (Object.keys(guildData).length === 0) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Tidak Ada Data')
                    .setDescription('Belum ada data pesan yang tersimpan. Data akan mulai dikumpulkan dari sekarang.')
                    .setTimestamp();
                
                return await message.reply({ embeds: [noDataEmbed] });
            }
            
            const sortedMembers = Object.entries(guildData)
                .map(([userId, data]) => [userId, data.count])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            let description = '';
            const medals = ['🥇', '🥈', '🥉'];
            let totalMessages = 0;
            
            for (let i = 0; i < sortedMembers.length; i++) {
                const [userId, count] = sortedMembers[i];
                const user = await message.client.users.fetch(userId).catch(() => null);
                const username = user ? user.displayName : 'Pengguna Tidak Dikenal';
                const medal = i < 3 ? medals[i] : `**${i + 1}.**`;
                
                description += `${medal} ${username} - **${formatNumber(count)}** pesan\n`;
                totalMessages += count;
            }
            
            const topEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`📊 Top 10 Member Paling Aktif`)
                .setDescription(description)
                .addFields(
                    { name: '📍 Cakupan', value: 'Semua Channel di Server', inline: true },
                    { name: '📈 Total Pesan', value: formatNumber(totalMessages), inline: true },
                    { name: '👥 Total Member Aktif', value: Object.keys(guildData).length.toString(), inline: true }
                )
                .setFooter({ text: `Diperbarui setiap hari • ${message.guild.name}` })
                .setTimestamp();
            
            await message.reply({ embeds: [topEmbed] });
            
        } catch (error) {
            console.error('Error dalam command topmem:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Terjadi Kesalahan')
                .setDescription('Gagal mengambil data pesan. Silakan coba lagi nanti.')
                .setTimestamp();
            
            await message.reply({ embeds: [errorEmbed] });
        }
    },
    
    updateMessageCount,
    resetDailyStats
};

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'jt';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'rb';
    }
    return num.toString();
}