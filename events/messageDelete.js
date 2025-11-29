const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

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

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🗑️ Pesan Dihapus')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .addFields(
                { 
                    name: '👤 Pengguna', 
                    value: `${message.author.tag}\n\`${message.author.id}\``, 
                    inline: true 
                },
                { 
                    name: '📍 Channel', 
                    value: `${message.channel}\n\`${message.channel.id}\``, 
                    inline: true 
                },
                { 
                    name: '⏰ Waktu', 
                    value: `<t:${Math.floor(Date.now() / 1000)}:F>`, 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: `User ID: ${message.author.id}`,
                iconURL: message.guild.iconURL({ dynamic: true })
            });

        if (message.content) {
            embed.addFields({
                name: '💬 Konten Pesan',
                value: message.content.length > 1024 
                    ? message.content.substring(0, 1021) + '...' 
                    : message.content
            });
        }

        if (message.attachments.size > 0) {
            const attachmentList = message.attachments.map(att => `[${att.name}](${att.url})`).join('\n');
            embed.addFields({
                name: '📎 Lampiran',
                value: attachmentList.length > 1024 
                    ? attachmentList.substring(0, 1021) + '...' 
                    : attachmentList
            });
        }

        logChannel.send({ embeds: [embed] }).catch(console.error);
    },
};
