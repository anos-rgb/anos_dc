module.exports = {
    name: 'renamevc',
    description: 'Rename voice channel lo - created by anos6501',
    aliases: ['vcname', 'changename'],
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

        if (!args[0]) {
            return message.reply('❌ Lo harus kasih nama baru! Contoh: `!renamevc Gaming Room`');
        }

        const newName = args.join(' ');
        if (newName.length > 100) {
            return message.reply('❌ Nama channel terlalu panjang! Maksimal 100 karakter.');
        }

        if (newName.length < 2) {
            return message.reply('❌ Nama channel terlalu pendek! Minimal 2 karakter.');
        }

        try {
            const oldName = memberVoice.name;
            await memberVoice.setName(newName);

            const embed = {
                color: 0x00ff88,
                title: '📝 Voice Channel Renamed',
                description: `Voice channel berhasil di-rename!\n\n` +
                           `**Old Name:** ${oldName}\n` +
                           `**New Name:** ${newName}\n\n` +
                           `Channel name berhasil diubah oleh owner.\n\n` +
                           `*Renamed by anos.py*`,
                footer: {
                    text: 'Voice Rename - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Rename VC error:', error);
            if (error.code === 50013) {
                message.reply('❌ Bot tidak punya permission untuk rename channel!');
            } else if (error.code === 50035) {
                message.reply('❌ Nama channel tidak valid! Gunakan karakter yang diizinkan Discord.');
            } else {
                message.reply('❌ Gagal me-rename voice channel!');
            }
        }
    }
};