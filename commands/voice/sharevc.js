module.exports = {
    name: 'sharevc',
    description: 'Bagikan voice channel ke member lain',
    aliases: ['bagikancvc'],
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
            return message.reply('❌ Lo harus mention user yang mau diundang! Contoh: `!sharevc @user`');
        }

        try {
            await memberVoice.permissionOverwrites.edit(targetUser.id, {
                VIEW_CHANNEL: true,
                CONNECT: true
            });

            const embed = {
                color: 0x00ff00,
                title: '👍 VC Dibagikan',
                description: `**${targetUser.tag}** berhasil diundang ke voice channel **${memberVoice.name}**!\n\n` +
                           `User sekarang bisa join dan berinteraksi di channel ini.\n\n` +
                           `*Dibagikan oleh ${message.author}*`,
                footer: {
                    text: 'Share VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Share VC error:', error);
            message.reply('❌ Gagal membagikan voice channel!');
        }
    }
};