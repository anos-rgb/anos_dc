const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const warningsFile = path.join(__dirname, '..', 'data', 'warnings.json');

async function loadWarnings() {
    try {
        const data = await fs.readFile(warningsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function saveWarnings(warnings) {
    try {
        await fs.mkdir(path.dirname(warningsFile), { recursive: true });
        await fs.writeFile(warningsFile, JSON.stringify(warnings, null, 2));
    } catch (error) {
        console.error('Error saving warnings:', error);
    }
}

module.exports = {
    name: 'unwarn',
    description: 'Hapus peringatan member',
    usage: '!unwarn <latest/all> <@user>',
    permissions: [PermissionFlagsBits.ModerateMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: `!unwarn <latest/all> <@user>`');
        }

        const subcommand = args[0].toLowerCase();
        if (!['latest', 'all'].includes(subcommand)) {
            return message.reply('Subcommand harus `latest` atau `all`');
        }

        const target = message.mentions.users.first() || message.guild.members.cache.get(args[1])?.user;
        if (!target) {
            return message.reply('Silakan mention user atau berikan user ID yang valid!');
        }

        try {
            const warnings = await loadWarnings();
            const guildId = message.guild.id;
            const userId = target.id;

            if (!warnings[guildId]?.[userId] || warnings[guildId][userId].length === 0) {
                return message.reply(`${target.tag} tidak memiliki peringatan.`);
            }

            const userWarnings = warnings[guildId][userId];
            let removedCount = 0;

            if (subcommand === 'latest') {
                const sortedWarnings = userWarnings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                sortedWarnings.shift();
                warnings[guildId][userId] = sortedWarnings;
                removedCount = 1;
            } else if (subcommand === 'all') {
                removedCount = userWarnings.length;
                warnings[guildId][userId] = [];
            }

            await saveWarnings(warnings);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Peringatan Berhasil Dihapus')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Member', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Peringatan Dihapus', value: removedCount.toString(), inline: true },
                    { name: 'Sisa Peringatan', value: warnings[guildId][userId].length.toString(), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat menghapus peringatan!');
        }
    },
};