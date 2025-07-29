module.exports = {
    name: 'transferallvc',
    description: 'Transfer semua ownership voice channel ke user lain',
    aliases: ['transfersemuavec'],
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

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ Lo harus mention user yang mau jadi owner baru! Contoh: `!transferallvc @user`');
        }

        try {
            const createdChannels = guildData.createdChannels;
            let transferCount = 0;

            for (const userId in createdChannels) {
                const channel = message.guild.channels.cache.get(createdChannels[userId].channelId);
                if (channel) {
                    // Ubah permission owner lama
                    await channel.permissionOverwrites.edit(userId, {
                        MANAGE_CHANNELS: null,
                        MANAGE_PERMISSIONS: null,
                        MUTE_MEMBERS: null,
                        DEAFEN_MEMBERS: null,
                        MOVE_MEMBERS: null
                    });

                    // Beri permission owner baru
                    await channel.permissionOverwrites.edit(targetUser.id, {
                        MANAGE_CHANNELS: true,
                        MANAGE_PERMISSIONS: true,
                        MUTE_MEMBERS: true,
                        DEAFEN_MEMBERS: true,
                        MOVE_MEMBERS: true
                    });

                    // Update data
                    createdChannels[targetUser.id] = createdChannels[userId];
                    delete createdChannels[userId];
                    transferCount++;
                }
            }

            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0xcc00cc,
                title: '👑 Semua VC Ditransfer',
                description: `Semua ownership voice channel (${transferCount} channel) berhasil ditransfer ke **${targetUser.tag}**!\n\n` +
                           `• Semua channel sekarang dimiliki oleh ${targetUser}\n` +
                           `• Owner lama tidak lagi memiliki kontrol\n\n` +
                           `*Ditransfer oleh ${message.author}*`,
                footer: {
                    text: 'Transfer All VC - anos6501',
                    icon_url: targetUser.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Transfer All VC error:', error);
            message.reply('❌ Gagal mentransfer semua voice channel!');
        }
    }
};