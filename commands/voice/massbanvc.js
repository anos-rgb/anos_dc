module.exports = {
    name: 'massbanvc',
    description: 'Ban banyak user dari voice channel',
    aliases: ['massbanvoice'],
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

        const targetUsers = message.mentions.users;
        if (targetUsers.size === 0) {
            return message.reply('❌ Lo harus mention user yang mau di-ban! Contoh: `!massbanvc @user1 @user2`');
        }

        let bannedCount = 0;

        try {
            for (const [userId, user] of targetUsers) {
                if (userId === message.author.id) continue;

                const targetMember = message.guild.members.cache.get(userId);
                if (!targetMember) continue;

                if (memberVoice.members.has(userId)) {
                    await targetMember.voice.disconnect('Mass banned from voice channel');
                }

                await memberVoice.permissionOverwrites.edit(userId, {
                    CONNECT: false,
                    VIEW_CHANNEL: true
                });

                if (!createdChannels[channelOwner].bannedUsers) {
                    createdChannels[channelOwner].bannedUsers = [];
                }
                createdChannels[channelOwner].bannedUsers.push(userId);
                
                bannedCount++;
            }
            
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0xff0000,
                title: '🚫 Mass Ban VC',
                description: `**${bannedCount}** user berhasil di-ban dari voice channel **${memberVoice.name}**!\n\n` +
                           `**Banned by:** ${message.author}\n\n` +
                           `User tidak bisa join ke voice channel ini lagi.\n` +
                           `Gunakan \`!unbanvc @user\` untuk unban.\n\n` +
                           `*Mass banned via anos.py*`,
                footer: {
                    text: 'Mass Ban VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Mass Ban VC error:', error);
            message.reply('❌ Gagal melakukan mass ban voice channel!');
        }
    }
};