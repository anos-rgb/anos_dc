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
        welcomech: null,
        goodbyeChannel: null,
        goodbyech: null,
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
    name: 'goodbye2',
    description: 'Setup sistem pesan perpisahan',
    usage: '!goodbye2 <#channel> <pesan>',

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: `!goodbye2 <#channel> <pesan>`\nContoh: `!goodbye2 #goodbye Selamat tinggal {nickname}!`');
        }

        const channelMention = args[0];
        const channelId = channelMention.replace(/[<#>]/g, '');
        const channel = message.guild.channels.cache.get(channelId);

        if (!channel) {
            return message.reply('Channel tidak ditemukan!');
        }

        if (!channel.isTextBased()) {
            return message.reply('Channel harus berupa text channel!');
        }

        const goodbyeMessage = args.slice(1).join(' ');

        const guildData = getGuildData(message.guild.id);
        guildData.goodbyech = channel.id;
        guildData.goodbyeMessage = goodbyeMessage;
        saveGuildData(message.guild.id, guildData);

        await message.reply(`Pesan goodbye akan dikirim ke ${channel}\nPesan: ${goodbyeMessage}`);
    },
};