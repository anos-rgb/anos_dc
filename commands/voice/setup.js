const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'setup',
    description: 'Setup sistem voice channel otomatis - dibuat oleh anos6501',
    aliases: ['setupvoice', 'vcsetup'],
    cooldown: 10,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('❌ Lo butuh permission `MANAGE_CHANNELS` buat setup ini!');
        }
        
        try {
            const guild = message.guild;
            
            if (!fs.existsSync('./data')) {
                fs.mkdirSync('./data', { recursive: true });
            }
            
            const category = await guild.channels.create({
                name: 'CREATE VOICE',
                type: ChannelType.GuildCategory
            });
            
            const textChannel = await guild.channels.create({
                name: 'voice-settings',
                type: ChannelType.GuildText,
                parent: category.id,
                topic: 'Tempat untuk mengatur voice channel - hanya bisa diatur disini!',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }
                ]
            });
            
            const voiceChannel = await guild.channels.create({
                name: 'JOIN TO CREATE',
                type: ChannelType.GuildVoice,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.Connect
                        ]
                    }
                ]
            });
            
            const dataPath = './data/voicesetup.json';
            let data = {};
            
            if (fs.existsSync(dataPath)) {
                try {
                    const fileContent = fs.readFileSync(dataPath, 'utf8');
                    data = JSON.parse(fileContent);
                } catch (parseError) {
                    console.error('Error parsing existing data:', parseError);
                    data = {};
                }
            }
            
            data[guild.id] = {
                categoryId: category.id,
                textChannelId: textChannel.id,
                voiceChannelId: voiceChannel.id,
                createdChannels: {}
            };
            
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
            
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
            
            await message.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Setup voice error:', error);
            await message.reply('❌ Terjadi error saat setup voice channel! Pastikan bot memiliki permission yang cukup.');
        }
    }
};
