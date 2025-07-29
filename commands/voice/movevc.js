module.exports = {
    name: 'movevc',
    description: 'Pindahkan semua member di voice channel ke channel lain',
    aliases: ['pindahkanvc'],
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

        const targetChannel = message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(c => c.name === args.join(' '));
        if (!targetChannel || targetChannel.type !== 'GUILD_VOICE') {
            return message.reply('❌ Channel target tidak valid! Kasih ID atau nama channel voice.');
        }

        try {
            const membersToMove = memberVoice.members.filter(member => !member.user.bot);
            
            for (const [memberId, member] of membersToMove) {
                await member.voice.setChannel(targetChannel);
            }

            const embed = {
                color: 0x6600ff,
                title: '👥 Member Dipindahkan',
                description: `Semua member (${membersToMove.size} orang) di voice channel **${memberVoice.name}** telah dipindahkan ke **${targetChannel.name}**!\n\n` +
                           `**Dipindahkan oleh:** ${message.author}\n\n` +
                           `*Pindahan via anos.py*`,
                footer: {
                    text: 'Move VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Move VC error:', error);
            message.reply('❌ Gagal memindahkan member voice channel!');
        }
    }
};