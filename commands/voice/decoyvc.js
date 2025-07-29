module.exports = {
    name: 'decoyvc',
    description: 'Buat voice channel tiruan untuk mengelabui orang',
    aliases: ['fakevc'],
    cooldown: 10,
    async execute(message, args, client) {
        const fs = require('fs');
        const path = './data/voicesetup.json';
        
        if (!fs.existsSync(path)) {
            return message.reply('❌ Voice system belum di-setup!');
        }
        
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        const guildData = data[message.guild.id];
        
        if (!guildData) {
            return message.reply('❌ Voice system belum di-setup untuk server ini!');
        }

        try {
            const decoyChannel = await message.guild.channels.create('Private Room', {
                type: 'GUILD_VOICE',
                parent: guildData.categoryId,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        deny: ['VIEW_CHANNEL', 'CONNECT']
                    },
                    {
                        id: message.author.id,
                        allow: ['VIEW_CHANNEL', 'CONNECT', 'MANAGE_CHANNELS']
                    }
                ]
            });

            const embed = {
                color: 0x333333,
                title: '👁️‍🗨️ VC Tiruan Dibuat',
                description: `Voice channel tiruan berhasil dibuat!\n\n` +
                           `**Channel:** ${decoyChannel}\n` +
                           `**Hanya visible untuk:** ${message.author}\n\n` +
                           `Channel ini bisa digunakan untuk mengelabui orang.\n\n` +
                           `*Dibuat oleh ${message.author}*`,
                footer: {
                    text: 'Decoy VC - anos6501',
                    icon_url: message.author.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Decoy VC error:', error);
            message.reply('❌ Gagal membuat voice channel tiruan!');
        }
    }
};