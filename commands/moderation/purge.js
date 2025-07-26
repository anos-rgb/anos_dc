const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Hapus sejumlah pesan di channel',
    usage: '!purge <jumlah> [@user]',
    permissions: [PermissionFlagsBits.ManageMessages],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!purge <jumlah> [@user]`');
        }

        const jumlah = parseInt(args[0]);
        
        if (isNaN(jumlah) || jumlah < 1 || jumlah > 100) {
            return message.reply('❌ Jumlah harus berupa angka antara 1-100!');
        }

        let target = null;
        if (args[1]) {
            const targetMention = args[1];
            const targetId = targetMention.replace(/[<@!>]/g, '');
            
            try {
                target = await message.client.users.fetch(targetId);
            } catch (error) {
                return message.reply('❌ User tidak ditemukan!');
            }
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: 100 });
            
            let messagesToDelete;
            if (target) {
                messagesToDelete = messages.filter(msg => msg.author.id === target.id).first(jumlah);
            } else {
                messagesToDelete = messages.first(jumlah + 1);
            }

            const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
            const validMessages = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);

            if (validMessages.length === 0) {
                return message.reply('❌ Tidak ada pesan yang bisa dihapus (pesan lebih dari 14 hari tidak bisa dihapus)!');
            }

            await message.channel.bulkDelete(validMessages, true);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Pesan Berhasil Dihapus')
                .addFields(
                    { name: 'Jumlah Dihapus', value: validMessages.length.toString(), inline: true },
                    { name: 'Channel', value: message.channel.toString(), inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'anos6501' });

            if (target) {
                embed.addFields({ name: 'Target User', value: target.tag, inline: true });
            }

            const replyMessage = await message.reply({ embeds: [embed] });
            
            setTimeout(() => {
                replyMessage.delete().catch(console.error);
            }, 5000);

        } catch (error) {
            console.error(error);
            await message.reply('❌ Terjadi error saat menghapus pesan!');
        }
    },
};