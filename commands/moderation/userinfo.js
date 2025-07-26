const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Tampilkan informasi user',
    usage: '!userinfo [@user]',
    aliases: ['ui', 'user'],

    async execute(message, args) {
        let target;
        
        if (args[0]) {
            const mention = args[0].replace(/[<@!>]/g, '');
            target = message.guild.members.cache.get(mention) || 
                    message.guild.members.cache.find(member => 
                        member.user.username.toLowerCase().includes(args[0].toLowerCase()) || 
                        member.displayName.toLowerCase().includes(args[0].toLowerCase())
                    );
            target = target ? target.user : null;
        } else {
            target = message.author;
        }

        if (!target) {
            return message.reply('User tidak ditemukan!');
        }

        try {
            const member = await message.guild.members.fetch(target.id);
            const createdAt = Math.floor(target.createdTimestamp / 1000);
            const joinedAt = Math.floor(member.joinedTimestamp / 1000);

            const roles = member.roles.cache
                .filter(role => role.id !== message.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString())
                .slice(0, 10);

            const statusEmoji = {
                online: '🟢',
                idle: '🟡',
                dnd: '🔴',
                offline: '⚫'
            };

            const status = member.presence?.status || 'offline';
            const activity = member.presence?.activities[0];

            const embed = new EmbedBuilder()
                .setColor(member.displayHexColor || 0x0099FF)
                .setTitle(`Informasi User: ${target.tag}`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '🆔 ID User', value: target.id, inline: true },
                    { name: '📝 Username', value: target.username, inline: true },
                    { name: '🏷️ Discriminator', value: `#${target.discriminator}`, inline: true },
                    { name: '📅 Akun Dibuat', value: `<t:${createdAt}:R>`, inline: true },
                    { name: '📥 Bergabung Server', value: `<t:${joinedAt}:R>`, inline: true },
                    { name: `${statusEmoji[status]} Status`, value: status.charAt(0).toUpperCase() + status.slice(1), inline: true },
                    { name: '🤖 Bot', value: target.bot ? 'Ya' : 'Tidak', inline: true },
                    { name: '🎨 Warna Role', value: member.displayHexColor || 'Default', inline: true },
                    { name: '📍 Posisi Tertinggi', value: member.roles.highest.name, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            if (activity) {
                embed.addFields({ 
                    name: '🎮 Aktivitas', 
                    value: `${activity.type === 0 ? 'Bermain' : activity.type === 1 ? 'Streaming' : activity.type === 2 ? 'Mendengarkan' : activity.type === 3 ? 'Menonton' : 'Custom'} ${activity.name}`, 
                    inline: false 
                });
            }

            if (roles.length > 0) {
                embed.addFields({ 
                    name: `🏷️ Role (${member.roles.cache.size - 1})`, 
                    value: roles.join(' ') + (member.roles.cache.size > 11 ? '...' : ''), 
                    inline: false 
                });
            }

            if (member.premiumSince) {
                const boostedSince = Math.floor(member.premiumSinceTimestamp / 1000);
                embed.addFields({ 
                    name: '💎 Nitro Booster', 
                    value: `Sejak <t:${boostedSince}:R>`, 
                    inline: true 
                });
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat mengambil informasi user!');
        }
    },
};