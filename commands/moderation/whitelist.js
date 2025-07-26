const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'whitelist',
    description: 'Tambah atau hapus domain dari whitelist',
    usage: '!whitelist <add|remove|list> [domain]',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        const action = args[0];
        const domain = args[1];

        if (!action || !['add', 'remove', 'list'].includes(action.toLowerCase())) {
            return message.reply('❌ Action tidak valid! Gunakan: `add`, `remove`, atau `list`');
        }

        const guildData = client.loadGuildData(message.guild.id);
        
        if (!guildData.allowedLinks) {
            guildData.allowedLinks = [];
        }

        switch (action.toLowerCase()) {
            case 'add':
                if (!domain) {
                    return message.reply('❌ Domain diperlukan untuk menambah whitelist!');
                }

                const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
                
                if (guildData.allowedLinks.includes(cleanDomain)) {
                    return message.reply(`❌ Domain **${cleanDomain}** sudah ada dalam whitelist!`);
                }

                guildData.allowedLinks.push(cleanDomain);
                client.saveGuildData(message.guild.id, guildData);

                await message.reply(`✅ Domain **${cleanDomain}** berhasil ditambahkan ke whitelist!`);
                break;

            case 'remove':
                if (!domain) {
                    return message.reply('❌ Domain diperlukan untuk menghapus dari whitelist!');
                }

                const domainToRemove = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
                const index = guildData.allowedLinks.indexOf(domainToRemove);
                
                if (index === -1) {
                    return message.reply(`❌ Domain **${domainToRemove}** tidak ada dalam whitelist!`);
                }

                guildData.allowedLinks.splice(index, 1);
                client.saveGuildData(message.guild.id, guildData);

                await message.reply(`✅ Domain **${domainToRemove}** berhasil dihapus dari whitelist!`);
                break;

            case 'list':
                if (guildData.allowedLinks.length === 0) {
                    return message.reply('📝 Whitelist kosong!');
                }

                const embed = {
                    title: '📝 Whitelist Domains',
                    description: guildData.allowedLinks.map((domain, i) => `${i + 1}. ${domain}`).join('\n'),
                    color: 0x00ff00
                };

                await message.reply({
                    embeds: [embed]
                });
                break;
        }
    }
};