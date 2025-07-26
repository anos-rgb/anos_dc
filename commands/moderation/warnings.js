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

module.exports = {
    name: 'warnings',
    description: 'Lihat peringatan member',
    usage: '!warnings <@user>',
    permissions: [PermissionFlagsBits.ModerateMembers],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('Anda tidak memiliki izin untuk menggunakan command ini!');
        }

        if (!args[0]) {
            return message.reply('Silakan mention user yang ingin dilihat peringatannya!\nContoh: `!warnings @user`');
        }

        const targetId = args[0].replace(/[<@!>]/g, '');
        const target = await message.client.users.fetch(targetId).catch(() => null);

        if (!target) {
            return message.reply('User tidak ditemukan! Pastikan Anda mention user yang valid.');
        }

        try {
            const warnings = await loadWarnings();
            const guildId = message.guild.id;
            const userId = target.id;

            const userWarnings = warnings[guildId]?.[userId] || [];

            if (userWarnings.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('Tidak Ada Peringatan')
                    .setDescription(`${target.tag} tidak memiliki peringatan.`)
                    .setThumbnail(target.displayAvatarURL())
                    .setFooter({ text: 'anos6501' });

                return message.reply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle(`Peringatan untuk ${target.tag}`)
                .setThumbnail(target.displayAvatarURL())
                .setDescription(`Total: ${userWarnings.length} peringatan`)
                .setFooter({ text: 'anos6501' });

            const sortedWarnings = userWarnings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            for (let i = 0; i < Math.min(sortedWarnings.length, 10); i++) {
                const warning = sortedWarnings[i];
                const moderator = await message.client.users.fetch(warning.moderator).catch(() => ({ tag: 'Unknown' }));
                const date = new Date(warning.timestamp);
                
                embed.addFields({
                    name: `Peringatan #${i + 1}`,
                    value: `**Alasan:** ${warning.reason}\n**Moderator:** ${moderator.tag}\n**Tanggal:** <t:${Math.floor(date.getTime() / 1000)}:R>`,
                    inline: false
                });
            }

            if (userWarnings.length > 10) {
                embed.setDescription(`Total: ${userWarnings.length} peringatan (Menampilkan 10 terakhir)`);
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await message.reply('Terjadi error saat mengambil data peringatan!');
        }
    },
};