module.exports = {
    name: 'welcome',
    description: 'Set welcome channel dan pesan',
    permissions: ['Administrator'],
    
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        const channelMention = args[0];
        if (!channelMention) {
            return message.reply('❌ Silakan mention channel yang ingin dijadikan welcome channel!\nContoh: `!welcome #general`');
        }

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(channelMention);
        if (!channel) {
            return message.reply('❌ Channel tidak ditemukan! Pastikan kamu mention channel yang benar.');
        }

        if (!channel.isTextBased()) {
            return message.reply('❌ Channel harus berupa text channel!');
        }

        const guildData = client.loadGuildData(message.guild.id);
        guildData.welcomeChannel = channel.id;
        client.saveGuildData(message.guild.id, guildData);

        await message.reply(`✅ Welcome channel berhasil diset ke ${channel}!`);
    }
};