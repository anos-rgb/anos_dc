module.exports = {
    name: 'hidevc',
    description: 'Sembunyikan voice channel dari member tertentu',
    aliases: ['sembunyikancvc'],
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
        
        const createdChannels = guildData(createdChannels);
        const channelOwner = Object.keys(createdChannels).find(userId => 
            createdChannels[userId].channelId === memberVoice.id
        );
        
        if (channelOwner !== message.author.id) {
            return message.reply('❌ Lo bukan owner dari voice channel ini!');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ Lo harus mention user yang mau disembunyikan! Contoh: `!hidevc @user`');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('❌ User tidak ditemukan di server ini!');
        }

        try {
            await memberVoice.permissionOverwrites.edit(targetUser.id, {
                VIEW_CHANNEL: false,
                CONNECT: false
            });

            const embed = {
                color: 0x333333,
                title: '隱私權 VC Disembunyikan',
                description: `Voice channel **${memberVoice.name}** sekarang disembunyikan dari **${targetUser.tag}**!\n\n` +
                           `User tidak bisa melihat atau join ke channel ini.\n\n` +
                           `*Disembunyikan oleh ${message.author}*`,
                footer: {
                    text: 'Hide VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Hide VC error:', error);
            message.reply('❌ Gagal menyembunyikan voice channel!');
        }
    }
};