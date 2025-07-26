const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

function getGuildData(guildId) {
    const filePath = path.join(__dirname, '..', 'data', `${guildId}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return {
        welcomeChannel: null,
        goodbyeChannel: null,
        registerChannel: null,
        registerRole: null,
        antiLink: false,
        allowedLinks: [],
        gameRoles: [],
        gameRoleChannel: null,
        randomRoles: [],
        randomRoleMenus: [],
        adminRole: null,
        nameRequests: {},
        deleteLogChannel: null,
        reactRoles: {},
        welcomeMessage: null,
        goodbyeMessage: null
    };
}

function saveGuildData(guildId, data) {
    const dirPath = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, `${guildId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'reactrole',
    description: 'Setup sistem reaction role',
    usage: '!reactrole <#channel> <@role> [pesan]',
    permissions: [PermissionFlagsBits.ManageRoles],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: `!reactrole <#channel> <@role> [pesan]`');
        }

        const channelMention = args[0];
        const roleMention = args[1];
        const customMessage = args.slice(2).join(' ');

        const channelId = channelMention.replace(/[<#>]/g, '');
        const roleId = roleMention.replace(/[<@&>]/g, '');

        let channel;
        let role;

        try {
            channel = await message.guild.channels.fetch(channelId);
            role = await message.guild.roles.fetch(roleId);
        } catch (error) {
            return message.reply('❌ Channel atau role tidak ditemukan!');
        }

        if (!channel) {
            return message.reply('❌ Channel tidak ditemukan!');
        }

        if (!role) {
            return message.reply('❌ Role tidak ditemukan!');
        }

        if (!channel.isTextBased()) {
            return message.reply('❌ Channel harus berupa text channel!');
        }

        if (role.position >= message.member.roles.highest.position) {
            return message.reply('❌ Kamu tidak bisa memberikan role yang lebih tinggi atau sama dengan role tertinggimu!');
        }

        const messageContent = customMessage || `React dengan ✅ untuk mendapatkan role ${role.name}!`;

        try {
            const sentMessage = await channel.send(messageContent);
            await sentMessage.react('✅');

            const guildData = getGuildData(message.guild.id);
            if (!guildData.reactRoles) {
                guildData.reactRoles = {};
            }
            
            guildData.reactRoles[sentMessage.id] = {
                roleId: role.id,
                emoji: '✅'
            };
            
            saveGuildData(message.guild.id, guildData);

            await message.reply(`✅ Reaction role berhasil disetup! Pesan dikirim ke ${channel} dengan role ${role.name}`);
        } catch (error) {
            console.error('Error setting up reaction role:', error);
            await message.reply('❌ Terjadi error saat setup reaction role!');
        }
    },
};