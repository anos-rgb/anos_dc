module.exports = {
    name: 'autovc',
    description: 'Aktifkan atau nonaktifkan pembuatan voice channel otomatis',
    aliases: ['autovc'],
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
        
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply('❌ Lo butuh permission `MANAGE_CHANNELS` buat ini!');
        }

        try {
            const currentSetting = guildData.autoCreate !== undefined ? guildData.autoCreate : false;
            const newSetting = !currentSetting;
            
            guildData.autoCreate = newSetting;
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: newSetting ? 0x00ff00 : 0xff0000,
                title: newSetting ? '✅ Auto VC Diaktifkan' : '❌ Auto VC Dinonaktifkan',
                description: `Pembuatan voice channel otomatis sekarang ${newSetting ? 'diaktifkan' : 'dinonaktifkan'}!\n\n` +
                           `${newSetting ? 'Setiap member yang join akan otomatis membuat room baru' : 'Member harus join manual ke room utama untuk membuat room'}\n\n` +
                           `*Pengaturan diubah oleh ${message.author}*`,
                footer: {
                    text: 'Auto VC Setting - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Auto VC error:', error);
            message.reply('❌ Gagal mengubah pengaturan auto VC!');
        }
    }
};