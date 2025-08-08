const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'youtifmessage',
    description: 'Mengatur pesan custom untuk notifikasi YouTube',
    aliases: ['ytmsg', 'ytmessage'],
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply('❌ Kamu butuh permission `MANAGE_CHANNELS` untuk menggunakan command ini!');
        }

        const messagesPath = path.join(__dirname, '../../data/youtube_messages.json');
        
        if (!fs.existsSync(messagesPath)) {
            const defaultMessages = {
                video: '📹 **{author}** baru upload video:\n**{title}**\n🔗 {url}',
                short: '⚡ **{author}** baru upload short:\n**{title}**\n🔗 {url}',
                live: '🔴 **{author}** sedang live:\n**{title}**\n🔗 {url}',
                upcoming: '⏰ **{author}** akan live:\n**{title}**\n🔗 {url}'
            };
            fs.writeFileSync(messagesPath, JSON.stringify(defaultMessages, null, 2));
        }

        if (args.length < 2) {
            return message.reply('❌ Gunakan: `!youtifmessage <video|short|live|upcoming> <pesan custom>`\n\n**Variabel yang bisa digunakan:**\n`{title}` - Judul video\n`{author}` - Nama channel\n`{url}` - Link video\n`{type}` - Jenis konten');
        }

        const type = args[0].toLowerCase();
        const customMessage = args.slice(1).join(' ');

        const validTypes = ['video', 'short', 'live', 'upcoming'];
        if (!validTypes.includes(type)) {
            return message.reply(`❌ Tipe tidak valid! Gunakan: ${validTypes.join(', ')}`);
        }

        const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
        messages[type] = customMessage;
        
        fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
        
        message.reply(`✅ Pesan custom untuk **${type}** berhasil diatur!\n\n**Preview:**\n${customMessage.replace('{title}', 'Contoh Judul').replace('{author}', 'Contoh Channel').replace('{url}', 'https://youtube.com/watch?v=example').replace('{type}', type)}`);
    }
};