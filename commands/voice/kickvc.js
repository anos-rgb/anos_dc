module.exports = {
    name: 'kickvc',
    description: 'Kick user dari voice channel lo - created by anos6501',
    aliases: ['vckick', 'kickvoice'],
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
            return message.reply('❌ Lo harus mention user yang mau di-kick! Contoh: `!kickvc @user`');
        }

        if (targetUser.id === message.author.id) {
            return message.reply('❌ Lo gabisa kick diri sendiri dari voice channel lo sendiri!');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('❌ User tidak ditemukan di server ini!');
        }

        if (!memberVoice.members.has(targetUser.id)) {
            return message.reply('❌ User yang lo mention tidak ada di voice channel ini!');
        }

        try {
            await targetMember.voice.disconnect('Kicked by voice channel owner');

            const embed = {
                color: 0xff6600,
                title: '👢 User Kicked from Voice',
                description: `**${targetUser.tag}** berhasil di-kick dari voice channel!\n\n` +
                           `**Channel:** ${memberVoice.name}\n` +
                           `**Kicked by:** ${message.author}\n` +
                           `**Target:** ${targetUser}\n\n` +
                           `User telah di-disconnect dari voice channel.\n\n` +
                           `*Kicked via anos.py*`,
                footer: {
                    text: 'Voice Kick - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Kick VC error:', error);
            if (error.code === 50013) {
                message.reply('❌ Bot tidak punya permission untuk disconnect user!');
            } else {
                message.reply('❌ Gagal kick user dari voice channel!');
            }
        }
    }
};