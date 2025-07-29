module.exports = {
    name: 'mutevc',
    description: 'Mute user di voice channel',
    aliases: ['diamkancvc'],
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
            return message.reply('❌ Lo harus mention user yang mau dimute! Contoh: `!mutevc @user`');
        }

        if (targetUser.id === message.author.id) {
            return message.reply('❌ Lo gabisa mute diri sendiri!');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('❌ User tidak ditemukan di server ini!');
        }

        if (!memberVoice.members.has(targetUser.id)) {
            return message.reply('❌ User yang lo mention tidak ada di voice channel ini!');
        }

        try {
            await targetMember.voice.setMute(true);

            const embed = {
                color: 0x9900ff,
                title: '🔇 User Dimute',
                description: `**${targetUser.tag}** berhasil dimute di voice channel **${memberVoice.name}**!\n\n` +
                           `**Dimute oleh:** ${message.author}\n\n` +
                           `User tidak bisa bicara di voice channel ini selama tidak di-unmute.\n\n` +
                           `*Muted via anos.py*`,
                footer: {
                    text: 'Mute VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Mute VC error:', error);
            message.reply('❌ Gagal memute user di voice channel!');
        }
    }
};