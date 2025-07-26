const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'cn',
    description: 'Request untuk ganti nama/nickname',
    usage: '!cn <nama-baru>',

    async execute(message, args, client) {
        if (args.length === 0) {
            return message.reply('Usage: `!cn <nama-baru>`');
        }

        const newName = args.join(' ');
        
        if (newName.length > 32) {
            return message.reply('❌ Nama baru tidak boleh lebih dari 32 karakter!');
        }

        const member = message.member;
        const guild = message.guild;

        const guildData = client.loadGuildData(guild.id);
        
        if (!guildData.adminRole) {
            return message.reply('❌ Admin role belum diset! Gunakan `/setadmin` untuk mengatur admin role.');
        }

        const adminRole = guild.roles.cache.get(guildData.adminRole);
        if (!adminRole) {
            return message.reply('❌ Admin role tidak ditemukan!');
        }

        const requestId = `cn_${Date.now()}_${member.id}`;
        
        if (!guildData.nameRequests) {
            guildData.nameRequests = {};
        }

        guildData.nameRequests[requestId] = {
            userId: member.id,
            currentName: member.displayName,
            requestedName: newName,
            timestamp: Date.now(),
            status: 'pending'
        };

        client.saveGuildData(guild.id, guildData);

        const adminEmbed = {
            title: '📝 Permintaan Ganti Nama',
            color: 0xffaa00,
            fields: [
                {
                    name: '👤 User',
                    value: `${member.user} (${member.user.tag})`,
                    inline: false
                },
                {
                    name: '📋 Nama Sekarang',
                    value: member.displayName || member.user.username,
                    inline: true
                },
                {
                    name: '✨ Nama Baru',
                    value: newName,
                    inline: true
                },
                {
                    name: '🆔 User ID',
                    value: member.id,
                    inline: true
                }
            ],
            thumbnail: {
                url: member.user.displayAvatarURL({ dynamic: true })
            },
            footer: {
                text: `Request ID: ${requestId}`,
                icon_url: guild.iconURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_cn_${requestId}`)
                    .setLabel('✅ Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`reject_cn_${requestId}`)
                    .setLabel('❌ Reject')
                    .setStyle(ButtonStyle.Danger)
            );

        const adminUsers = guild.members.cache.filter(m => m.roles.cache.has(adminRole.id));
        
        let sentToAdmin = false;
        for (const [, adminMember] of adminUsers) {
            try {
                await adminMember.send({
                    embeds: [adminEmbed],
                    components: [buttons]
                });
                sentToAdmin = true;
            } catch (error) {
                console.log(`Could not send DM to admin ${adminMember.user.tag}`);
            }
        }

        if (!sentToAdmin) {
            return message.reply('❌ Tidak bisa mengirim pesan ke admin. Pastikan admin mengizinkan DM.');
        }

        const userEmbed = {
            title: '📝 Permintaan Ganti Nama Terkirim',
            description: `Permintaan untuk mengganti nama ke **${newName}** telah dikirim ke admin.\n\nAdmin akan merespon dalam waktu dekat.`,
            color: 0x00ff00,
            footer: {
                text: 'Mohon tunggu konfirmasi dari admin'
            },
            timestamp: new Date()
        };

        await message.reply({
            embeds: [userEmbed]
        });

        setTimeout(async () => {
            const currentData = client.loadGuildData(guild.id);
            if (currentData.nameRequests && currentData.nameRequests[requestId] && 
                currentData.nameRequests[requestId].status === 'pending') {
                
                currentData.nameRequests[requestId].status = 'timeout';
                client.saveGuildData(guild.id, currentData);

                try {
                    const user = await client.users.fetch(member.id);
                    const timeoutEmbed = {
                        title: '⏰ Permintaan Timeout',
                        description: `Permintaan ganti nama ke **${newName}** belum direspon admin.\n\nAdmin sedang sibuk, silakan coba lagi nanti.`,
                        color: 0xff9900,
                        footer: {
                            text: 'Silakan submit ulang permintaan jika diperlukan'
                        }
                    };

                    await user.send({ embeds: [timeoutEmbed] });
                } catch (error) {
                    console.error('Could not send timeout message to user:', error);
                }
            }
        }, 300000);
    }
};