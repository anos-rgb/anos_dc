module.exports = {
    name: 'yankvc',
    description: 'Ambil user dari voice channel lain',
    aliases: ['tarikvc'],
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
            return message.reply('❌ Lo harus mention user yang mau diambil! Contoh: `!yankvc @user`');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('❌ User tidak ditemukan di server ini!');
        }

        const targetVoice = targetMember.voice.channel;
        if (!targetVoice) {
            return message.reply('❌ User tidak ada di voice channel mana-mana!');
        }

        try {
            await targetMember.voice.setChannel(memberVoice);

            const embed = {
                color: 0xff0000,
                title: '❌ User Ditarik',
                description: `**${targetUser.tag}** berhasil ditarik dari **${targetVoice.name}** ke **${memberVoice.name}**!\n\n` +
                           `• Ditarik oleh: ${message.author}\n` +
                           `• Total member sekarang: ${memberVoice.members.size}\n\n` +
                           `*Ditarik oleh ${message.author}*`,
                footer: {
                    text: 'Yank VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Yank VC error:', error);
            message.reply('❌ Gagal menarik user dari voice channel!');
        }
    }
};