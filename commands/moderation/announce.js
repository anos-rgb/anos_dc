const { PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'pengumuman',
    description: 'Buat pengumuman dengan embed',
    permissions: [PermissionFlagsBits.ManageMessages],
    usage: '!pengumuman <judul> | <isi> | [channel] | [warna] | [gambar] | [ping_everyone]',
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ Kamu tidak memiliki izin untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('❌ Format: `!pengumuman <judul> | <isi> | [channel] | [warna] | [gambar] | [ping_everyone]`');
        }

        const input = args.join(' ').split('|').map(item => item.trim());
        
        if (input.length < 2) {
            return message.reply('❌ Minimal harus ada judul dan isi pengumuman!');
        }

        const title = input[0];
        const content = input[1];
        let targetChannel = message.channel;
        let color = '#0099ff';
        let imageUrl = null;
        let pingEveryone = false;

        if (input[2]) {
            const channelMention = input[2].match(/<#(\d+)>/);
            if (channelMention) {
                const channel = message.guild.channels.cache.get(channelMention[1]);
                if (channel && channel.type === ChannelType.GuildText) {
                    targetChannel = channel;
                } else {
                    return message.reply('❌ Channel tidak valid atau bukan text channel!');
                }
            } else if (input[2].toLowerCase() !== 'default') {
                return message.reply('❌ Format channel salah! Gunakan mention channel atau "default"');
            }
        }

        if (input[3]) {
            const colorInput = input[3].trim();
            if (colorInput.match(/^#[0-9A-F]{6}$/i) || colorInput.toLowerCase() !== 'default') {
                color = colorInput;
            }
        }

        if (input[4] && input[4].trim().toLowerCase() !== 'default') {
            const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
            if (urlRegex.test(input[4].trim())) {
                imageUrl = input[4].trim();
            } else {
                return message.reply('❌ URL gambar tidak valid!');
            }
        }

        if (input[5]) {
            const pingInput = input[5].trim().toLowerCase();
            if (pingInput === 'true' || pingInput === 'yes' || pingInput === '1') {
                pingEveryone = true;
            }
        }

        try {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(content)
                .setColor(color)
                .setTimestamp()
                .setFooter({ text: `Pengumuman dari ${message.author.tag} | anos6501` });

            if (imageUrl) {
                embed.setImage(imageUrl);
            }

            const messageContent = pingEveryone ? '@everyone' : '';

            await targetChannel.send({ 
                content: messageContent,
                embeds: [embed] 
            });

            await message.reply(`✅ Pengumuman berhasil dikirim ke ${targetChannel}!`);

        } catch (error) {
            await message.reply('❌ Gagal mengirim pengumuman! Pastikan bot memiliki izin yang cukup.');
        }
    },
};

// anos6501