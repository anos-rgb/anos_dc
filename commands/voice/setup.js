module.exports = {
    name: 'setup',
    description: 'Setup sistem voice channel otomatis - dibuat oleh anos6501',
    aliases: ['setupvoice', 'vcsetup'],
    cooldown: 10,
    async execute(message, args, client) {
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply('❌ Lo butuh permission `MANAGE_CHANNELS` buat setup ini!');
        }

        try {
            const guild = message.guild;
            
            const category = await guild.channels.create('CREATE VOICE', {
                type: 'GUILD_CATEGORY',
                position: 0
            });

            const textChannel = await guild.channels.create('voice-settings', {
                type: 'GUILD_TEXT',
                parent: category.id,
                topic: 'Tempat untuk mengatur voice channel - hanya bisa diatur disini!',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                    }
                ]
            });

            const voiceChannel = await guild.channels.create('JOIN TO CREATE', {
                type: 'GUILD_VOICE',
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: ['VIEW_CHANNEL', 'CONNECT']
                    }
                ]
            });

            const fs = require('fs');
            const path = './data/voicesetup.json';
            let data = {};
            
            if (fs.existsSync(path)) {
                data = JSON.parse(fs.readFileSync(path, 'utf8'));
            }
            
            data[guild.id] = {
                categoryId: category.id,
                textChannelId: textChannel.id,
                voiceChannelId: voiceChannel.id,
                createdChannels: {}
            };
            
            fs.writeFileSync(path, JSON.stringify(data, null, 2));

            const embed = {
                color: 0x00ff00,
                title: '✅ Voice Setup Berhasil!',
                description: `Setup voice channel berhasil dibuat oleh **anos.py**\n\n` +
                           `📁 **Category:** ${category.name}\n` +
                           `💬 **Text Channel:** ${textChannel}\n` +
                           `🔊 **Voice Channel:** ${voiceChannel}\n\n` +
                           `**Cara kerja:**\n` +
                           `• Join ke voice **${voiceChannel.name}** untuk membuat room pribadi\n` +
                           `• Room akan otomatis terhapus jika kosong\n` +
                           `• Gunakan \`!myvc\` di ${textChannel} untuk mengatur voice\n\n` +
                           `*Sistem voice channel by anos6501*`,
                footer: {
                    text: 'Voice System - anos.py',
                    icon_url: client.user.displayAvatarURL()
                },
                timestamp: new Date()
            };

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Setup voice error:', error);
            message.reply('❌ Terjadi error saat setup voice channel!');
        }
    }
};