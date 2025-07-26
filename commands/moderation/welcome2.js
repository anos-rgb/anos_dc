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
    name: 'welcome2',
    description: 'Setup sistem pesan sambutan',
    usage: '!welcome2 <#channel> <pesan>',
    
    async execute(message, args) {
        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply('Kamu tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 2) {
            return message.reply('Usage: !welcome2 <#channel> <pesan>\nContoh: !welcome2 #general Selamat datang {nickname}!');
        }

        const channelMention = args[0];
        const welcomeMessage = args.slice(1).join(' ');

        const channelId = channelMention.replace(/[<#>]/g, '');
        const channel = message.guild.channels.cache.get(channelId);

        if (!channel) {
            return message.reply('Channel tidak ditemukan! Pastikan kamu mention channel yang valid.');
        }

        if (!channel.isTextBased()) {
            return message.reply('Channel harus berupa text channel!');
        }

        const guildData = getGuildData(message.guild.id);
        guildData.welcomech = channel.id;
        guildData.welcomeMessage = welcomeMessage;
        saveGuildData(message.guild.id, guildData);

        message.reply(`Pesan welcome akan dikirim ke ${channel}\nPesan: ${welcomeMessage}`);
    },
};