module.exports = {
    name: 'timeoutvc',
    description: 'Beri timeout kepada user di voice channel',
    aliases: ['waktudalamvc'],
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

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ Lo harus mention user yang mau diberi timeout! Contoh: `!timeoutvc @user 10`');
        }

        const duration = args[1] ? parseInt(args[1]) : 5; // Default 5 menit
        if (isNaN(duration) || duration < 1 || duration > 60) {
            return message.reply('❌ Durasi harus antara 1-60 menit! Contoh: `!timeoutvc @user 15`');
        }

        try {
            await memberVoice.permissionOverwrites.edit(targetUser.id, {
                CONNECT: false
            });

            const embed = {
                color: 0xff9900,
                title: '⏳ VC Timeout',
                description: `**${targetUser.tag}** diberi timeout di voice channel **${memberVoice.name}**!\n\n` +
                           `• Durasi: ${duration} menit\n` +
                           `• User tidak bisa join selama timeout\n\n` +
                           `*Diberi oleh ${message.author}*`,
                footer: {
                    text: 'Timeout VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

            // Hapus timeout setelah durasi
            setTimeout(async () => {
                await memberVoice.permissionOverwrites.edit(targetUser.id, {
                    CONNECT: null
                });
            }, duration * 60 * 1000);

        } catch (error) {
            console.error('Timeout VC error:', error);
            message.reply('❌ Gagal memberi timeout user di voice channel!');
        }
    }
};