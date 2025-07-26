const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'antikasar',
    description: 'Toggle sistem anti kata kasar otomatis',
    usage: '!antikasar <on/off>',
    
    async execute(message, args) {
        if (!args[0]) {
            const helpEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Argument Tidak Valid')
                .setDescription('Gunakan: `!antikasar <on/off>`')
                .setFooter({ text: 'anos6501' });
            
            return message.reply({ embeds: [helpEmbed] });
        }

        const action = args[0].toLowerCase();
        const guildId = message.guild.id;

        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Akses Ditolak')
                .setDescription('Kamu tidak memiliki permission untuk menggunakan command ini!')
                .setFooter({ text: 'anos6501' });
            
            return message.reply({ embeds: [noPermEmbed] });
        }

        const fs = require('fs');
        const configPath = './config.json';
        
        let config = {};
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }

        if (!config.antiKasar) config.antiKasar = {};

        if (action === 'on' || action === 'enable') {
            config.antiKasar[guildId] = {
                enabled: true,
                warnings: {}
            };

            const enableEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Anti Kata Kasar Diaktifkan')
                .setDescription('Sistem anti kata kasar sekarang aktif!\n\n**Aturan:**\n• Pesan dengan kata kasar akan dihapus otomatis\n• 3x warning = timeout 1 jam\n• Kata terlarang: anjing, ajg, bangsat, bego, tolol, goblok, kontol, memek, ngentot, fuck, shit, damn')
                .setFooter({ text: 'anos6501' });
            
            await message.reply({ embeds: [enableEmbed] });
        } else if (action === 'off' || action === 'disable') {
            config.antiKasar[guildId] = {
                enabled: false,
                warnings: {}
            };

            const disableEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Anti Kata Kasar Dinonaktifkan')
                .setDescription('Sistem anti kata kasar sekarang tidak aktif.')
                .setFooter({ text: 'anos6501' });
            
            await message.reply({ embeds: [disableEmbed] });
        } else {
            const invalidEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Argument Tidak Valid')
                .setDescription('Gunakan: `!antikasar <on/off>`')
                .setFooter({ text: 'anos6501' });
            
            return message.reply({ embeds: [invalidEmbed] });
        }

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    },
};