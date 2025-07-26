const fs = require('fs');
const path = require('path');

function getGuildData(guildId) {
    const filePath = path.join(__dirname, '..', 'data', `${guildId}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
}

module.exports = {
    name: 'messageDelete',
    execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const guildData = getGuildData(message.guild.id);
        if (!guildData || !guildData.deleteLogChannel) return;
        
        const logChannel = message.guild.channels.cache.get(guildData.deleteLogChannel);
        if (!logChannel) return;

        const logMessage = `**Pesan Dihapus**\n` +
                          `**Pengguna:** ${message.author.tag} (${message.author.id})\n` +
                          `**Channel:** ${message.channel.name} (${message.channel.id})\n` +
                          `**Konten:** ${message.content || 'Tidak ada konten'}\n` +
                          `**Waktu:** <t:${Math.floor(Date.now() / 1000)}:F>`;

        logChannel.send(logMessage).catch(console.error);
    },
};