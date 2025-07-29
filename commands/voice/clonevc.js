module.exports = {
    name: 'clonevc',
    description: 'Buat salinan voice channel',
    aliases: ['duplikatvc'],
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

        try {
            const newChannel = await message.guild.channels.create(`Copy of ${memberVoice.name}`, {
                type: 'GUILD_VOICE',
                parent: guildData.categoryId,
                permissionOverwrites: memberVoice.permissionOverwrites.cache.map(p => ({
                    id: p.id,
                    allow: p.allow,
                    deny: p.deny,
                    type: p.type
                }))
            });

            const embed = {
                color: 0x00ffcc,
                title: ' COPYING VC ',
                description: `Salinan voice channel berhasil dibuat!\n\n` +
                           `**Channel asli:** ${memberVoice.name}\n` +
                           `**Salinan baru:** ${newChannel}\n\n` +
                           `Salinan memiliki pengaturan yang sama dengan channel asli.\n\n` +
                           `*Dibuat oleh ${message.author}*`,
                footer: {
                    text: 'Clone VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Clone VC error:', error);
            message.reply('❌ Gagal membuat salinan voice channel!');
        }
    }
};