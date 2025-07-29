module.exports = {
    name: 'searchvc',
    description: 'Cari voice channel',
    aliases: ['carivc'],
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

        const searchQuery = args.join(' ');
        if (!searchQuery) {
            return message.reply('❌ Lo harus kasih kata kunci pencarian! Contoh: `!searchvc gaming`');
        }

        try {
            const createdChannels = guildData.createdChannels;
            const searchResults = Object.values(createdChannels).filter(channel => 
                message.guild.channels.cache.get(channel.channelId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(channel => message.guild.channels.cache.get(channel.channelId).name);

            const embed = {
                color: 0x0000ff,
                title: '🔍 Hasil Pencarian VC',
                description: `Hasil pencarian untuk **${searchQuery}**:\n\n` +
                           `${searchResults.length > 0 ? searchResults.join('\n') : 'Tidak ditemukan'}\n\n` +
                           `Jumlah hasil: ${searchResults.length}\n\n` +
                           `*Dicari oleh ${message.author}*`,
                footer: {
                    text: 'Search VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Search VC error:', error);
            message.reply('❌ Gagal melakukan pencarian voice channel!');
        }
    }
};