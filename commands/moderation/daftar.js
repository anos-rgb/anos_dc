const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'daftar',
    description: 'Set channel dan role untuk registrasi',
    usage: '!daftar <#channel> <@role>',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: `!daftar <#channel> <@role>`');
        }

        const channelMention = args[0];
        const roleMention = args[1];

        const channelId = channelMention.replace(/[<#>]/g, '');
        const roleId = roleMention.replace(/[<@&>]/g, '');

        let channel;
        let role;

        try {
            channel = await message.guild.channels.fetch(channelId);
        } catch (error) {
            return message.reply('❌ Channel tidak ditemukan!');
        }

        try {
            role = await message.guild.roles.fetch(roleId);
        } catch (error) {
            return message.reply('❌ Role tidak ditemukan!');
        }

        if (!channel.isTextBased()) {
            return message.reply('❌ Channel harus berupa text channel!');
        }

        const guildData = client.loadGuildData(message.guild.id);
        guildData.registerChannel = channel.id;
        guildData.registerRole = role.id;
        client.saveGuildData(message.guild.id, guildData);

        const embed = {
            title: '📝 Registrasi Member',
            description: `Silakan ketik \`reg [nama kamu]\` untuk mendaftar!\n\nContoh: \`reg John Doe\``,
            color: 0x00ff00,
            footer: {
                text: 'Registrasi akan memberikan role dan mengubah nickname kamu'
            }
        };

        await channel.send({ embeds: [embed] });

        await message.reply(`✅ Registrasi berhasil diset!\n**Channel:** ${channel}\n**Role:** ${role}`);
    }
};