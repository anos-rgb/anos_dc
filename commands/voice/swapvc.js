module.exports = {
    name: 'swapvc',
    description: 'Tukar dua member di voice channel',
    aliases: ['tukarvc'],
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

        const targetUsers = message.mentions.users;
        if (targetUsers.size < 2) {
            return message.reply('❌ Lo harus mention minimal 2 user yang mau ditukar! Contoh: `!swapvc @user1 @user2`');
        }

        const [user1, user2] = targetUsers.array().slice(0, 2);
        const member1 = message.guild.members.cache.get(user1.id);
        const member2 = message.guild.members.cache.get(user2.id);

        if (!member1 || !member2) {
            return message.reply('❌ Salah satu user tidak ditemukan di server!');
        }

        const voice1 = member1.voice.channel;
        const voice2 = member2.voice.channel;

        try {
            // Pindahkan member1 ke channel member2
            if (voice2) {
                await member1.voice.setChannel(voice2);
            } else {
                await member1.voice.setChannel(memberVoice);
            }

            // Pindahkan member2 ke channel member1 (sebelumnya)
            if (voice1) {
                await member2.voice.setChannel(voice1);
            } else if (voice2) {
                await member2.voice.setChannel(memberVoice);
            }

            const embed = {
                color: 0x0000ff,
                title: '🔄 VC Ditukar',
                description: `**${user1.tag}** dan **${user2.tag}** berhasil ditukar antar voice channel!\n\n` +
                           `• ${user1.tag}: ${voice2 ? voice2.name : 'Voice tidak aktif'} → ${voice1 ? voice1.name : 'Sini'}\n` +
                           `• ${user2.tag}: ${voice1 ? voice1.name : 'Voice tidak aktif'} → ${voice2 ? voice2.name : 'Sini'}\n\n` +
                           `*Ditukar oleh ${message.author}*`,
                footer: {
                    text: 'Swap VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Swap VC error:', error);
            message.reply('❌ Gagal menukar member di voice channel!');
        }
    }
};