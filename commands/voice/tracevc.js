module.exports = {
    name: 'tracevc',
    description: 'Lacak aktivitas voice channel',
    aliases: ['lacakkvc'],
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
        
        if (channelOwner !== message.author.id && !message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply('❌ Lo bukan owner dari voice channel ini atau tidak punya permission!');
        }

        try {
            const activityLogs = fs.readFileSync(`./data/logs/${message.guild.id}_vc_logs.txt`, 'utf8') || 'Tidak ada log aktivitas';
            
            const embed = {
                color: 0x9900cc,
                title: '🔍 Log Aktivitas VC',
                description: `Log aktivitas untuk voice channel **${memberVoice.name}**:\n\n` +
                           `\`\`\`\n${activityLogs.slice(-1000)}\n\`\`\`\n\n` +
                           `*Log terakhir 1000 karakter*\n` +
                           `*Dilacak oleh ${message.author}*`,
                footer: {
                    text: 'Trace VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Trace VC error:', error);
            message.reply('❌ Gagal melacak aktivitas voice channel!');
        }
    }
};