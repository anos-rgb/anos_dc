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
    name: 'log',
    description: 'Konfigurasi pengaturan logging',
    usage: '!log delete <#channel>',
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: `!log delete <#channel>`');
        }

        const subcommand = args[0].toLowerCase();

        if (subcommand === 'delete') {
            const channelMention = args[1];
            const channelId = channelMention.replace(/[<#>]/g, '');
            const channel = message.guild.channels.cache.get(channelId);

            if (!channel) {
                return message.reply('Channel tidak ditemukan!');
            }

            if (!channel.isTextBased()) {
                return message.reply('Channel harus berupa text channel!');
            }

            const guildData = getGuildData(message.guild.id);
            guildData.deleteLogChannel = channel.id;
            saveGuildData(message.guild.id, guildData);

            await message.reply(`Log delete akan dikirim ke ${channel}`);
        } else {
            return message.reply('Subcommand tidak valid! Gunakan: `!log delete <#channel>`');
        }
    },
};