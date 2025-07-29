module.exports = {
    name: 'resetvc',
    description: 'Reset pengaturan voice channel ke default',
    aliases: ['resetvoice'],
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

        try {
            // Reset permission ke default
            await memberVoice.permissionOverwrites.set([
                {
                    id: message.guild.roles.everyone.id,
                    allow: ['VIEW_CHANNEL', 'CONNECT']
                },
                {
                    id: message.author.id,
                    allow: ['MANAGE_CHANNELS', 'MANAGE_PERMISSIONS', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS']
                }
            ]);
            
            // Reset nama dan limit
            await memberVoice.setName('Default Channel');
            await memberVoice.setUserLimit(0);

            // Hapus data banned user
            if (createdChannels[channelOwner].bannedUsers) {
                createdChannels[channelOwner].bannedUsers = [];
            }

            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0x00cc00,
                title: '🔄 VC Di-reset',
                description: `Pengaturan voice channel **${memberVoice.name}** berhasil di-reset!\n\n` +
                           `• Nama channel: Default Channel\n` +
                           `• Batas user: Unlimited\n` +
                           `• Semua pengaturan kembali ke default\n\n` +
                           `*Di-reset oleh ${message.author}*`,
                footer: {
                    text: 'Reset VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Reset VC error:', error);
            message.reply('❌ Gagal mereset voice channel!');
        }
    }
};