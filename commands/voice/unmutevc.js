module.exports = {
    name: 'unmutevc',
    description: 'Batal mute user di voice channel',
    aliases: ['bukamutecvc'],
    cooldown: 3,
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
            return message.reply('❌ Lo harus mention user yang mau dibatal mute! Contoh: `!unmutevc @user`');
        }

        if (targetUser.id === message.author.id) {
            return message.reply('❌ Lo tidak bisa unmute diri sendiri!');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('❌ User tidak ditemukan di server ini!');
        }

        if (!memberVoice.members.has(targetUser.id)) {
            return message.reply('❌ User yang lo mention tidak ada di voice channel ini!');
        }

        if (!targetMember.voice.serverMute) {
            return message.reply('❌ User ini tidak dalam keadaan mute!');
        }

        try {
            await targetMember.voice.setMute(false);

            const embed = {
                color: 0x00ccff,
                title: '🔊 User Di-unmute',
                description: `**${targetUser.tag}** berhasil di-unmute di voice channel **${memberVoice.name}**!\n\n` +
                           `**Di-unmute oleh:** ${message.author}\n\n` +
                           `User sekarang bisa bicara di voice channel ini.\n\n` +
                           `*Unmuted via anos.py*`,
                footer: {
                    text: 'Unmute VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Unmute VC error:', error);
            message.reply('❌ Gagal membatal mute user di voice channel!');
        }
    }
};