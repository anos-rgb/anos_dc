const fs = require("fs");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "pajak",
    description: "Cek atau ubah persentase pajak transfer",
    aliases: ['tax'],
    cooldown: 5,
    execute(message, args, client) {
        const isAdmin = message.member.roles.cache.has("1368506120246919218");
        
        if (!client.database.pajak) client.database.pajak = 5;

        if (args[0] === "set" && isAdmin) {
            const persen = parseInt(args[1]);
            if (isNaN(persen) || persen < 0 || persen > 50) {
                return message.reply("Masukin angka yang valid bang (0-50%).");
            }
            
            client.database.pajak = persen;
            client.db.save(client.database);
            
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('⚖️ Pajak Diubah!')
                .setDescription(`Pajak transfer berhasil diubah menjadi **${persen}%**`)
                .setFooter({ text: 'Pengaturan pajak berhasil!' });
                
            return message.reply({ embeds: [embed] });
        }

        if (args[0] === "info") {
            const embed = new EmbedBuilder()
                .setColor('#4169E1')
                .setTitle('⚖️ Informasi Pajak')
                .setDescription(`Pajak transfer saat ini: **${client.database.pajak}%**`)
                .addFields(
                    { name: 'Cara Kerja', value: 'Setiap transfer akan dikenakan pajak sesuai persentase yang ditetapkan' },
                    { name: 'Contoh', value: `Transfer 1000 koin = pajak ${Math.floor(1000 * client.database.pajak / 100)} koin` }
                )
                .setFooter({ text: 'Pajak membantu stabilitas ekonomi server!' });
                
            return message.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('⚖️ Status Pajak')
            .setDescription(`Pajak transfer saat ini: **${client.database.pajak}%**`)
            .addFields(
                { name: 'Commands', value: '`!pajak` - Cek pajak\n`!pajak info` - Info detail\n`!pajak set <persen>` - Ubah pajak (Admin only)' }
            )
            .setFooter({ text: 'Gunakan !pajak info untuk detail lebih lanjut' });
            
        message.reply({ embeds: [embed] });
        
        if (client.database.users[message.author.id]) {
            client.database.users[message.author.id].statistik.command_digunakan++;
            client.db.save(client.database);
        }
    }
};