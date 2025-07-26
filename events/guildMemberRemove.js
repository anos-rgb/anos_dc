const path = require('path');

module.exports = {
    name: 'guildMemberRemove',
    execute(member, client) {
        const guildData = client.loadGuildData(member.guild.id);
        
        let channel;
        let isGoodbye2 = false;
        
        if (guildData.goodbyeChannel) {
            channel = member.guild.channels.cache.get(guildData.goodbyeChannel);
        } else if (guildData.goodbyech) {
            channel = member.guild.channels.cache.get(guildData.goodbyech);
            isGoodbye2 = true;
        }
        
        if (!channel) return;

        const memberCount = member.guild.memberCount;

        if (isGoodbye2) {
            let message = guildData.goodbyeMessage || `**${member.user.username}** telah meninggalkan **${member.guild.name}**. Sampai jumpa!`;
            message = message.replace(/{nickname}/g, member.displayName);
            message = message.replace(/{username}/g, member.user.username);
            message = message.replace(/{server}/g, member.guild.name);
            message = message.replace(/{membercount}/g, memberCount);
            message = message.replace(/{@}/g, member.toString());
            
            channel.send(message).catch(console.error);
        } else {
            const embed = {
                title: '👋 Selamat Tinggal!',
                description: `**${member.user.username}** telah meninggalkan server.\n\nSemoga sukses selalu!`,
                color: 0xff0000,
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true })
                },
                image: {
                    url: 'attachment://Goodbye.gif'
                },
                fields: [
                    {
                        name: '👤 Username',
                        value: member.user.username,
                        inline: true
                    },
                    {
                        name: '🆔 User ID',
                        value: member.user.id,
                        inline: true
                    },
                    {
                        name: '📊 Member Sekarang',
                        value: memberCount.toString(),
                        inline: true
                    }
                ],
                footer: {
                    text: member.guild.name,
                    icon_url: member.guild.iconURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            const gifPath = path.join(__dirname, '..', 'media', 'Goodbye.gif');
            
            channel.send({
                embeds: [embed],
                files: [{
                    attachment: gifPath,
                    name: 'Goodbye.gif'
                }]
            }).catch(error => {
                console.error('Error sending goodbye message:', error);
                channel.send({ embeds: [embed] }).catch(console.error);
            });
        }
    }
};