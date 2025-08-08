const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'youtif',
    description: 'Mengatur notifikasi YouTube untuk video baru',
    aliases: ['ytif', 'ytnotif'],
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply('❌ Kamu butuh permission `MANAGE_CHANNELS` untuk menggunakan command ini!');
        }

        const dataPath = path.join(__dirname, '../../data/youtube_notifications.json');
        const messagesPath = path.join(__dirname, '../../data/youtube_messages.json');
        
        if (!fs.existsSync(path.dirname(dataPath))) {
            fs.mkdirSync(path.dirname(dataPath), { recursive: true });
        }
        
        if (!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
        }

        if (!fs.existsSync(path.dirname(messagesPath))) {
            fs.mkdirSync(path.dirname(messagesPath), { recursive: true });
        }

        if (!fs.existsSync(messagesPath)) {
            const defaultMessages = {
                video: '📹 **{author}** baru upload video:\n**{title}**\n🔗 {url}',
                short: '⚡ **{author}** baru upload short:\n**{title}**\n🔗 {url}',
                live: '🔴 **{author}** sedang live:\n**{title}**\n🔗 {url}',
                upcoming: '⏰ **{author}** akan live:\n**{title}**\n🔗 {url}'
            };
            fs.writeFileSync(messagesPath, JSON.stringify(defaultMessages, null, 2));
        }

        let notifications = [];
        try {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            notifications = Array.isArray(data) ? data : [];
        } catch (error) {
            notifications = [];
        }
        
        const subcommand = args[0]?.toLowerCase();

        if (subcommand === 'add') {
            if (args.length < 3) {
                return message.reply('❌ Gunakan: `!youtif add <url> #channel [embed]`');
            }

            const url = args[1];
            const channelMention = args[2];
            const useEmbed = args[3]?.toLowerCase() === 'embed';

            const channelMatch = channelMention.match(/<#(\d+)>/);
            if (!channelMatch) {
                return message.reply('❌ Channel Discord tidak valid! Gunakan mention channel (#channel)');
            }

            const discordChannelId = channelMatch[1];
            const targetChannel = message.guild.channels.cache.get(discordChannelId);
            
            if (!targetChannel) {
                return message.reply('❌ Channel tidak ditemukan di server ini!');
            }

            let channelId;
            try {
                channelId = await extractChannelId(url);
            } catch (error) {
                return message.reply('❌ URL YouTube tidak valid! Gunakan URL channel dengan format: /channel/, /@username, atau /c/');
            }

            const existingIndex = notifications.findIndex(n => n.url === url);
            if (existingIndex !== -1) {
                notifications[existingIndex] = {
                    ...notifications[existingIndex],
                    discordChannelId,
                    useEmbed,
                    addedBy: message.author.id,
                    addedAt: new Date().toISOString()
                };
            } else {
                notifications.push({
                    url,
                    channelId,
                    discordChannelId,
                    useEmbed,
                    addedBy: message.author.id,
                    addedAt: new Date().toISOString(),
                    lastVideoId: null
                });
            }

            fs.writeFileSync(dataPath, JSON.stringify(notifications, null, 2));
            
            const embedText = useEmbed ? ' (dengan embed)' : ' (tanpa embed)';
            message.reply(`✅ Channel YouTube berhasil ditambahkan ke notifikasi!\n🔗 ${url}\n📢 Target: ${channelMention}${embedText}`);

        } else if (subcommand === 'remove') {
            if (args.length < 2) {
                return message.reply('❌ Gunakan: `!youtif remove <url>`');
            }

            const url = args[1];
            const index = notifications.findIndex(n => n.url === url);

            if (index === -1) {
                return message.reply('❌ Channel YouTube tidak ditemukan dalam daftar notifikasi!');
            }

            notifications.splice(index, 1);
            fs.writeFileSync(dataPath, JSON.stringify(notifications, null, 2));
            
            message.reply(`✅ Channel YouTube berhasil dihapus dari notifikasi!\n🔗 ${url}`);

        } else if (subcommand === 'list') {
            if (notifications.length === 0) {
                return message.reply('📋 Tidak ada channel YouTube yang dimonitor saat ini.');
            }

            let listText = '📋 **Daftar Channel YouTube yang Dimonitor:**\n\n';
            
            notifications.forEach((notif, index) => {
                const channel = message.guild.channels.cache.get(notif.discordChannelId);
                const channelName = channel ? `#${channel.name}` : 'Channel Deleted';
                const embedText = notif.useEmbed ? '📄' : '📝';
                
                listText += `**${index + 1}.** ${notif.url}\n`;
                listText += `   └ Target: ${channelName} ${embedText}\n`;
                listText += `   └ Ditambahkan: <@${notif.addedBy}>\n\n`;
            });

            if (listText.length > 2000) {
                listText = listText.substring(0, 1950) + '\n... (list dipotong karena terlalu panjang)';
            }

            message.reply(listText);

        } else {
            message.reply(`❌ Subcommand tidak valid!\n\n**Gunakan:**\n\`!youtif add <url> #channel [embed]\` - Tambah notifikasi\n\`!youtif remove <url>\` - Hapus notifikasi\n\`!youtif list\` - Lihat daftar notifikasi\n\`!youtifmessage <type> <pesan>\` - Set pesan custom`);
        }
    }
};

async function extractChannelId(url) {
    if (url.includes('/channel/')) {
        const match = url.match(/\/channel\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    } else if (url.includes('/@')) {
        const match = url.match(/\/@([a-zA-Z0-9_.-]+)/);
        return match ? match[1] : null;
    } else if (url.includes('/c/')) {
        const match = url.match(/\/c\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }
    throw new Error('Invalid URL format');
}

function getChannelIdFromUsername(username) {
    return username;
}

function getChannelIdFromCustomUrl(customUrl) {
    return customUrl;
}