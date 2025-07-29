module.exports = {
    name: 'renameallvc',
    description: 'Ubah nama semua voice channel',
    aliases: ['gantinamanSemua'],
    cooldown: 10,
    async execute(message, args, client) {
        const fs = require('fs');
        const path = './data/voicesetup.json';
        
        if (!fs.existsSync(path)) {
            return message.reply('❌ Voice system belum di-setup!');
        }
        
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        const guildData = data[message.guild.id];
        
        if (!guildData || message.channel.id !== guildData.textChannelId) {
            const textChannel = message.guild.channels.cache.get(guildData?.textChannelId);
            return message.reply(`❌ Command ini hanya bisa digunakan di ${textChannel}!`);
        }
        
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply('❌ Lo butuh permission `MANAGE_CHANNELS` buat ini!');
        }

        if (!args[0]) {
            return message.reply('❌ Lo harus kasih nama baru! Contoh: `!renameallvc Baru`');
        }

        const newName = args.join(' ');
        if (newName.length > 100) {
            return message.reply('❌ Nama channel terlalu panjang! Maksimal 100 karakter.');
        }

        try {
            const createdChannels = guildData.createdChannels;
            const renamedChannels = [];
            
            for (const userId in createdChannels) {
                const channel = message.guild.channels.cache.get(createdChannels[userId].channelId);
                if (channel) {
                    await channel.setName(newName);
                    renamedChannels.push(channel.name);
                }
            }

            const embed = {
                color: 0x00ff00,
                title: '📝 Semua VC Direname',
                description: `Semua voice channel (${renamedChannels.length} channel) berhasil di-rename!\n\n` +
                           `**Nama baru:** ${newName}\n\n` +
                           `*Direname oleh ${message.author}*`,
                footer: {
                    text: 'Rename All VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Rename All VC error:', error);
            message.reply('❌ Gagal merename semua voice channel!');
        }
    }
};