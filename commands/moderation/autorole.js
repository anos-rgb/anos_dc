const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'autorole',
    description: 'Set auto role dengan reminder',
    usage: '!autorole <@role> <#channel>',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: `!autorole <@role> <#channel>`');
        }

        const roleMention = args[0];
        const channelMention = args[1];

        const roleId = roleMention.replace(/[<@&>]/g, '');
        const channelId = channelMention.replace(/[<#>]/g, '');

        let role;
        try {
            role = await message.guild.roles.fetch(roleId);
            if (!role) {
                return message.reply('❌ Role tidak ditemukan!');
            }
        } catch (error) {
            return message.reply('❌ Role tidak valid!');
        }

        let channel;
        try {
            channel = await message.guild.channels.fetch(channelId);
            if (!channel) {
                return message.reply('❌ Channel tidak ditemukan!');
            }
        } catch (error) {
            return message.reply('❌ Channel tidak valid!');
        }

        if (!channel.isTextBased()) {
            return message.reply('❌ Channel harus berupa text channel!');
        }

        const guildData = client.loadGuildData(message.guild.id);
        
        if (!guildData.randomRoles) {
            guildData.randomRoles = [];
        }

        const existingIndex = guildData.randomRoles.findIndex(r => r.roleId === role.id);
        if (existingIndex !== -1) {
            guildData.randomRoles[existingIndex].channelId = channel.id;
        } else {
            guildData.randomRoles.push({
                roleId: role.id,
                channelId: channel.id
            });
        }

        client.saveGuildData(message.guild.id, guildData);

        await message.reply({
            content: `✅ Auto role berhasil diset!\n**Role:** ${role}\n**Channel Reminder:** ${channel}\n\nReminder akan dikirim setiap jam.`
        });
    }
};