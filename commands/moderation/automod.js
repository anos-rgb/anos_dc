const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const automodSettings = new Map();

module.exports = {
    name: 'automod',
    description: 'Pengaturan auto moderasi',
    permissions: [PermissionFlagsBits.ManageGuild],

    async execute(message, args) {
        const subcommand = args[0];
        const guildId = message.guild.id;

        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply('❌ Kamu tidak memiliki izin untuk menggunakan command ini!');
        }

        if (subcommand === 'setup') {
            const currentSettings = automodSettings.get(guildId) || {};
            
            let antiSpam = currentSettings.antiSpam || false;
            let antiLink = currentSettings.antiLink || false;
            let antiCaps = currentSettings.antiCaps || false;
            let spamLimit = currentSettings.spamLimit || 5;

            for (let i = 1; i < args.length; i++) {
                const arg = args[i].toLowerCase();
                if (arg === 'anti_spam:true' || arg === 'anti_spam:on') antiSpam = true;
                if (arg === 'anti_spam:false' || arg === 'anti_spam:off') antiSpam = false;
                if (arg === 'anti_link:true' || arg === 'anti_link:on') antiLink = true;
                if (arg === 'anti_link:false' || arg === 'anti_link:off') antiLink = false;
                if (arg === 'anti_caps:true' || arg === 'anti_caps:on') antiCaps = true;
                if (arg === 'anti_caps:false' || arg === 'anti_caps:off') antiCaps = false;
                if (arg.startsWith('spam_limit:')) {
                    const limit = parseInt(arg.split(':')[1]);
                    if (limit >= 2 && limit <= 10) spamLimit = limit;
                }
            }

            const newSettings = {
                antiSpam: antiSpam,
                antiLink: antiLink,
                antiCaps: antiCaps,
                spamLimit: spamLimit,
                userMessages: new Map()
            };

            automodSettings.set(guildId, newSettings);

            const embed = new EmbedBuilder()
                .setTitle('🛡️ Auto Moderasi - Setup')
                .setColor(0x00ff00)
                .addFields(
                    {
                        name: 'Anti Spam',
                        value: newSettings.antiSpam ? '✅ Aktif' : '❌ Nonaktif',
                        inline: true
                    },
                    {
                        name: 'Anti Link',
                        value: newSettings.antiLink ? '✅ Aktif' : '❌ Nonaktif',
                        inline: true
                    },
                    {
                        name: 'Anti Caps',
                        value: newSettings.antiCaps ? '✅ Aktif' : '❌ Nonaktif',
                        inline: true
                    },
                    {
                        name: 'Batas Spam',
                        value: `${newSettings.spamLimit} pesan per 5 detik`,
                        inline: false
                    }
                )
                .setFooter({ text: 'anos6501' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        }

        else if (subcommand === 'status') {
            const settings = automodSettings.get(guildId);

            if (!settings) {
                return message.reply('❌ Auto moderasi belum di-setup untuk server ini!');
            }

            const embed = new EmbedBuilder()
                .setTitle('🛡️ Status Auto Moderasi')
                .setColor(0x0099ff)
                .addFields(
                    {
                        name: 'Anti Spam',
                        value: settings.antiSpam ? '✅ Aktif' : '❌ Nonaktif',
                        inline: true
                    },
                    {
                        name: 'Anti Link',
                        value: settings.antiLink ? '✅ Aktif' : '❌ Nonaktif',
                        inline: true
                    },
                    {
                        name: 'Anti Caps',
                        value: settings.antiCaps ? '✅ Aktif' : '❌ Nonaktif',
                        inline: true
                    },
                    {
                        name: 'Batas Spam',
                        value: `${settings.spamLimit} pesan per 5 detik`,
                        inline: false
                    }
                )
                .setFooter({ text: 'anos6501' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        }

        else if (subcommand === 'reset') {
            automodSettings.delete(guildId);

            const embed = new EmbedBuilder()
                .setTitle('🛡️ Auto Moderasi - Reset')
                .setDescription('Pengaturan auto moderasi telah direset!')
                .setColor(0xff9900)
                .setFooter({ text: 'anos6501' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        }

        else {
            const helpEmbed = new EmbedBuilder()
                .setTitle('🛡️ Auto Moderasi - Help')
                .setDescription('Penggunaan command automod:')
                .addFields(
                    {
                        name: '!automod setup',
                        value: 'Setup auto moderasi dengan parameter:\n' +
                               '• `anti_spam:true/false` - Aktifkan/nonaktifkan anti spam\n' +
                               '• `anti_link:true/false` - Aktifkan/nonaktifkan anti link\n' +
                               '• `anti_caps:true/false` - Aktifkan/nonaktifkan anti caps\n' +
                               '• `spam_limit:2-10` - Set batas spam (2-10 pesan per 5 detik)',
                        inline: false
                    },
                    {
                        name: '!automod status',
                        value: 'Lihat status auto moderasi saat ini',
                        inline: false
                    },
                    {
                        name: '!automod reset',
                        value: 'Reset semua pengaturan auto moderasi',
                        inline: false
                    },
                    {
                        name: 'Contoh penggunaan:',
                        value: '`!automod setup anti_spam:true anti_link:true spam_limit:3`',
                        inline: false
                    }
                )
                .setColor(0x0099ff)
                .setFooter({ text: 'anos6501' })
                .setTimestamp();

            await message.reply({ embeds: [helpEmbed] });
        }
    },

    checkMessage(message) {
        const guildId = message.guild.id;
        const settings = automodSettings.get(guildId);

        if (!settings || message.author.bot) return false;

        const userId = message.author.id;
        const now = Date.now();

        if (settings.antiSpam) {
            if (!settings.userMessages.has(userId)) {
                settings.userMessages.set(userId, []);
            }

            const userMessages = settings.userMessages.get(userId);
            userMessages.push(now);

            const recentMessages = userMessages.filter(time => now - time < 5000);
            settings.userMessages.set(userId, recentMessages);

            if (recentMessages.length > settings.spamLimit) {
                message.delete().catch(() => {});
                message.channel.send(`${message.author}, jangan spam!`).then(msg => {
                    setTimeout(() => msg.delete().catch(() => {}), 3000);
                });
                return true;
            }
        }

        if (settings.antiLink) {
            const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;
            if (linkRegex.test(message.content)) {
                message.delete().catch(() => {});
                message.channel.send(`${message.author}, link tidak diizinkan!`).then(msg => {
                    setTimeout(() => msg.delete().catch(() => {}), 3000);
                });
                return true;
            }
        }

        if (settings.antiCaps) {
            const capsPercentage = (message.content.match(/[A-Z]/g) || []).length / message.content.length;
            if (message.content.length > 10 && capsPercentage > 0.7) {
                message.delete().catch(() => {});
                message.channel.send(`${message.author}, jangan menggunakan terlalu banyak huruf kapital!`).then(msg => {
                    setTimeout(() => msg.delete().catch(() => {}), 3000);
                });
                return true;
            }
        }

        return false;
    }
};