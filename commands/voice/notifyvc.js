module.exports = {
    name: 'notifyvc',
    description: 'Kirim notifikasi ke semua member di voice channel',
    aliases: ['beritahuvc'],
    cooldown: 5,
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
        
        const memberVoice = message.member.voice.channel;
        if (!memberVoice) {
            return message.reply('❌ Lo harus ada di voice channel dulu!');
        }
        
        const createdChannels = guildData.createdChannels;
        const channelOwner = Object.keys(createdChannels).find(userId => 
            createdChannels[userId].channelId === memberVoice.id
        );
        
        if (channelOwner !== message.author.id) {
            return message.reply('❌ Lo bukan owner dari voice channel ini!');
        }

        if (args.length === 0) {
            return message.reply('❌ Lo harus kasih pesan yang mau dikirim! Contoh: `!notifyvc Halo semua!`');
        }

        try {
            const notification = args.join(' ');
            const members = [...memberVoice.members.values()]; // Convert Collection to array

            let notificationMessage = '';
            for (const member of members) {
                notificationMessage += `${member.displayName}\n`; // Use display name
            }

            const embed = {
                color: 0x00ffff,
                title: '📣 Notifikasi Voice Channel',
                description: `Notifikasi dari **${memberVoice.name}**:\n\n` +
                           `${notification}\n\n` +
                           `**Penerima:**\n${notificationMessage || 'Tidak ada member di channel'}`,
                footer: {
                    text: 'Notify VC - anos6501',
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Notify VC error:', error);
            message.reply('❌ Gagal mengirim notifikasi!');
        }
    }
};