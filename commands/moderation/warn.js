const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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
    name: 'warn',
    description: 'Beri peringatan kepada member',
    usage: '!warn <@user> <alasan>',
    permissions: [PermissionFlagsBits.ModerateMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: !warn <@user> <alasan>');
        }

        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('Tolong mention user yang ingin diberi peringatan!');
        }

        const alasan = args.slice(1).join(' ');

        if (target.id === message.author.id) {
            return message.reply('Kamu tidak bisa warn diri sendiri!');
        }

        if (target.bot) {
            return message.reply('Kamu tidak bisa warn bot!');
        }

        try {
            const warnings = await loadWarnings();
            const guildId = message.guild.id;
            const userId = target.id;

            if (!warnings[guildId]) {
                warnings[guildId] = {};
            }

            if (!warnings[guildId][userId]) {
                warnings[guildId][userId] = [];
            }

            const warnData = {
                id: Date.now().toString(),
                reason: alasan,
                moderator: message.author.id,
                timestamp: new Date().toISOString()
            };

            warnings[guildId][userId].push(warnData);
            await saveWarnings(warnings);

            const totalWarnings = warnings[guildId][userId].length;

            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('Member Telah Diberi Peringatan')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Member', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true },
                    { name: 'Total Peringatan', value: totalWarnings.toString(), inline: true },
                    { name: 'Alasan', value: alasan, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            await message.reply({ embeds: [embed] });

            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xFFFF00)
                    .setTitle(`Kamu mendapat peringatan di ${message.guild.name}`)
                    .addFields(
                        { name: 'Alasan', value: alasan, inline: false },
                        { name: 'Moderator', value: message.author.tag, inline: true },
                        { name: 'Total Peringatan', value: totalWarnings.toString(), inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'anos6501' });

                await target.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log('Could not send DM to user');
            }

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat memberi peringatan!');
        }
    },
};