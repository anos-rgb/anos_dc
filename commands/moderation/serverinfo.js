const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'serverinfo',
    description: 'Tampilkan informasi server',
    usage: '!serverinfo',

    async execute(message, args) {
        const { guild } = message;

        try {
            const owner = await guild.fetchOwner();
            const createdAt = Math.floor(guild.createdTimestamp / 1000);
            
            const textChannels = guild.channels.cache.filter(ch => ch.type === 0).size;
            const voiceChannels = guild.channels.cache.filter(ch => ch.type === 2).size;
            const categories = guild.channels.cache.filter(ch => ch.type === 4).size;
            
            const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
            const bots = guild.members.cache.filter(member => member.user.bot).size;
            const humans = guild.memberCount - bots;

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Informasi Server: ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: '🆔 ID Server', value: guild.id, inline: true },
                    { name: '👑 Owner', value: owner.user.tag, inline: true },
                    { name: '📅 Dibuat', value: `<t:${createdAt}:R>`, inline: true },
                    { name: '👥 Total Member', value: guild.memberCount.toString(), inline: true },
                    { name: '🟢 Online', value: onlineMembers.toString(), inline: true },
                    { name: '🤖 Bot', value: bots.toString(), inline: true },
                    { name: '👤 Manusia', value: humans.toString(), inline: true },
                    { name: '🏷️ Total Role', value: guild.roles.cache.size.toString(), inline: true },
                    { name: '😀 Total Emoji', value: guild.emojis.cache.size.toString(), inline: true },
                    { name: '💬 Text Channel', value: textChannels.toString(), inline: true },
                    { name: '🔊 Voice Channel', value: voiceChannels.toString(), inline: true },
                    { name: '📁 Kategori', value: categories.toString(), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            if (guild.description) {
                embed.setDescription(guild.description);
            }

            if (guild.bannerURL()) {
                embed.setImage(guild.bannerURL({ dynamic: true }));
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat mengambil informasi server!');
        }
    },
};