const { PermissionFlagsBits } = require('discord.js');

const tempBans = new Map();

module.exports = {
    name: 'tempban',
    description: 'Ban sementara user',
    usage: '!tempban <@user> <durasi_menit> [alasan]',
    permissions: [PermissionFlagsBits.BanMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: `!tempban <@user> <durasi_menit> [alasan]`');
        }

        const targetMention = args[0];
        const duration = parseInt(args[1]);
        const reason = args.slice(2).join(' ') || 'Tidak ada alasan yang diberikan';

        const targetId = targetMention.replace(/[<@!>]/g, '');
        
        if (isNaN(duration) || duration < 1 || duration > 43200) {
            return message.reply('❌ Durasi harus berupa angka antara 1-43200 menit!');
        }

        let targetUser;
        try {
            targetUser = await message.client.users.fetch(targetId);
        } catch (error) {
            return message.reply('❌ User tidak ditemukan!');
        }

        const member = message.guild.members.cache.get(targetUser.id);

        if (!member) {
            return message.reply('❌ User tidak ditemukan di server ini!');
        }

        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('❌ Anda tidak dapat mem-ban user dengan role yang sama atau lebih tinggi!');
        }

        try {
            await member.ban({ reason: `Temp Ban: ${reason}` });

            const unbanTime = Date.now() + (duration * 60 * 1000);
            tempBans.set(targetUser.id, {
                guildId: message.guild.id,
                unbanTime: unbanTime,
                reason: reason
            });

            setTimeout(async () => {
                try {
                    await message.guild.members.unban(targetUser.id, 'Temp ban expired');
                    tempBans.delete(targetUser.id);
                } catch (error) {
                    console.log('Gagal unban otomatis:', error);
                }
            }, duration * 60 * 1000);

            const embed = {
                title: '⏰ Temporary Ban',
                color: 0xff9900,
                fields: [
                    {
                        name: 'User',
                        value: `${targetUser.tag} (${targetUser.id})`,
                        inline: true
                    },
                    {
                        name: 'Durasi',
                        value: `${duration} menit`,
                        inline: true
                    },
                    {
                        name: 'Berakhir pada',
                        value: `<t:${Math.floor(unbanTime / 1000)}:F>`,
                        inline: false
                    },
                    {
                        name: 'Alasan',
                        value: reason,
                        inline: false
                    },
                    {
                        name: 'Admin',
                        value: message.author.tag,
                        inline: true
                    }
                ],
                footer: { text: 'anos6501' },
                timestamp: new Date()
            };

            await message.reply({ embeds: [embed] });

            try {
                await targetUser.send({
                    embeds: [{
                        title: '⏰ Anda telah di-ban sementara',
                        description: `Anda telah di-ban dari server **${message.guild.name}** selama ${duration} menit.`,
                        fields: [
                            {
                                name: 'Alasan',
                                value: reason
                            },
                            {
                                name: 'Berakhir pada',
                                value: `<t:${Math.floor(unbanTime / 1000)}:F>`
                            }
                        ],
                        color: 0xff9900,
                        footer: { text: 'anos6501' },
                        timestamp: new Date()
                    }]
                });
            } catch (error) {
                console.log('Tidak dapat mengirim DM ke user');
            }

        } catch (error) {
            await message.reply('❌ Gagal mem-ban user! Pastikan bot memiliki izin yang cukup.');
        }
    },
};