module.exports = {
    name: 'myvc',
    description: 'Kelola voice channel pribadi lo - coded by anos6501',
    aliases: ['voicecontrol', 'vc'],
    cooldown: 3,
    async execute(message, args, client) {
        const fs = require('fs');
        const path = './data/voicesetup.json';
        
        if (!fs.existsSync(path)) {
            return message.reply('❌ Voice system belum di-setup! Gunakan `!setup` dulu.');
        }
        
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        const guildData = data[message.guild.id];
        
        if (!guildData) {
            return message.reply('❌ Voice system belum di-setup untuk server ini!');
        }
        
        if (message.channel.id !== guildData.textChannelId) {
            const textChannel = message.guild.channels.cache.get(guildData.textChannelId);
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
        
        if (!channelOwner) {
            return message.reply('❌ Ini bukan voice channel yang dibuat dari sistem!');
        }
        
        if (channelOwner !== message.author.id) {
            return message.reply('❌ Lo bukan owner dari voice channel ini!');
        }

        const embed = {
            color: 0x0099ff,
            title: '🎛️ Voice Channel Control Panel',
            description: `**Owner:** ${message.author}\n` +
                        `**Channel:** ${memberVoice.name}\n` +
                        `**Members:** ${memberVoice.members.size}\n\n` +
                        `**Commands yang tersedia:**\n\n` +
                        `🔒 \`!lockvc\` - Kunci voice channel\n` +
                        `🔓 \`!unlockvc\` - Buka kunci voice channel\n` +
                        `👑 \`!transfervc <@user>\` - Transfer ownership\n` +
                        `👥 \`!limitvc <angka>\` - Set user limit (0 = unlimited)\n` +
                        `📝 \`!renamevc <nama>\` - Rename voice channel\n` +
                        `👢 \`!kickvc <@user>\` - Kick user dari voice\n` +
                        `🚫 \`!banvc <@user>\` - Ban user dari voice\n` +
                        `✅ \`!unbanvc <@user>\` - Unban user dari voice\n` +
                        `🗑️ \`!deletevc\` - Hapus voice channel\n` +
                        `ℹ️ \`!infovc\` - Info voice channel\n\n` +
                        `*Voice System by anos.py*`,
            footer: {
                text: 'Voice Control - anos6501',
                icon_url: client.user.displayAvatarURL()
            },
            timestamp: new Date()
        };

        message.reply({ embeds: [embed] });
    }
};