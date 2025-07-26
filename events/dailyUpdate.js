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

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        setInterval(async () => {
            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                await updateDailyStats(client);
            }
        }, 60000);
    }
};

async function updateDailyStats(client) {
    try {
        const dailyData = await loadDatabase(DAILY_DATABASE_PATH);
        const guilds = client.guilds.cache;
        
        for (const guild of guilds.values()) {
            const guildDailyData = dailyData[guild.id] || {};
            
            if (Object.keys(guildDailyData).length === 0) {
                console.log(`Tidak ada data harian untuk server: ${guild.name}`);
                continue;
            }
            
            const sortedMembers = Object.entries(guildDailyData)
                .map(([userId, data]) => [userId, data.count])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            let description = '';
            const medals = ['🥇', '🥈', '🥉'];
            let totalDailyMessages = 0;
            
            for (let i = 0; i < sortedMembers.length; i++) {
                const [userId, count] = sortedMembers[i];
                const user = await client.users.fetch(userId).catch(() => null);
                const username = user ? user.displayName : 'Pengguna Tidak Dikenal';
                const medal = i < 3 ? medals[i] : `**${i + 1}.**`;
                
                description += `${medal} ${username} - **${formatNumber(count)}** pesan\n`;
                totalDailyMessages += count;
            }
            
            const dailyEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`📊 Top 10 Member Paling Aktif Kemarin`)
                .setDescription(description)
                .addFields(
                    { name: '📍 Cakupan', value: 'Semua Channel di Server', inline: true },
                    { name: '📅 Periode', value: 'Kemarin (24 jam terakhir)', inline: true },
                    { name: '👥 Total Member Aktif', value: Object.keys(guildDailyData).length.toString(), inline: true },
                    { name: '📈 Total Pesan', value: formatNumber(totalDailyMessages), inline: true }
                )
                .setFooter({ text: `Update otomatis harian • ${guild.name}` })
                .setTimestamp();
            
            const systemChannel = guild.systemChannel || 
                                guild.channels.cache.find(ch => 
                                    ch.isTextBased() && 
                                    ch.permissionsFor(guild.members.me)?.has(['SendMessages'])
                                );
            
            if (systemChannel) {
                await systemChannel.send({ embeds: [dailyEmbed] });
                console.log(`Laporan harian dikirim ke server: ${guild.name}`);
            }
        }
        
        await saveDatabase({}, DAILY_DATABASE_PATH);
        console.log('Reset data harian selesai');
        
    } catch (error) {
        console.error('Error dalam update statistik harian:', error);
    }
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'jt';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'rb';
    }
    return num.toString();
}