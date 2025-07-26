const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'hapus',
    description: 'Hapus beberapa pesan sekaligus dalam channel',
    aliases: ['clear', 'bersihkan'],
    cooldown: 5,
    permissions: [PermissionFlagsBits.ManageMessages],
    botPermissions: [PermissionFlagsBits.ManageMessages],
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('Kamu tidak memiliki izin untuk menggunakan perintah ini!');
        }

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('Bot tidak memiliki izin untuk menghapus pesan!');
        }

        const jumlah = parseInt(args[0]);

        if (!jumlah || isNaN(jumlah)) {
            return message.reply('Masukkan jumlah pesan yang valid! Contoh: `!hapus 10`');
        }

        if (jumlah <= 0 || jumlah > 100) {
            return message.reply('Jumlah pesan harus antara 1 sampai 100!');
        }

        try {
            const channel = message.channel;
            const deletedMessages = await channel.bulkDelete(jumlah, true);
            
            const reply = await message.reply(`Berhasil menghapus ${deletedMessages.size} pesan!`);
            
            setTimeout(async () => {
                try {
                    await reply.delete();
                    await message.delete();
                } catch (err) {
                    console.log('Gagal menghapus pesan konfirmasi:', err);
                }
            }, 3000);

        } catch (error) {
            console.error('Error saat menghapus pesan:', error);
            
            let pesanError = 'Terjadi masalah saat menghapus pesan!';
            
            if (error.code === 10008) {
                pesanError = 'Pesan tidak ditemukan atau sudah terhapus!';
            } else if (error.code === 50013) {
                pesanError = 'Bot tidak memiliki izin yang cukup untuk menghapus pesan!';
            } else if (error.code === 50034) {
                pesanError = 'Tidak bisa menghapus pesan yang lebih lama dari 14 hari!';
            }
            
            message.reply(pesanError);
        }
    }
};