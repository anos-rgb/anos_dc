const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');

const statsDataPath = path.join(__dirname, '..', 'data', 'serverstats.json');

module.exports = {
  name: 'autorestart',
  description: 'Mengatur auto restart server stats',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('Anda tidak memiliki izin untuk menggunakan command ini!');
    }

    const guildId = message.guild.id;
    
    if (!fs.existsSync(statsDataPath)) {
      return message.reply('File server stats tidak ditemukan!');
    }

    const statsData = JSON.parse(fs.readFileSync(statsDataPath, 'utf8'));
    
    if (!statsData[guildId]) {
      return message.reply('Server stats belum aktif di server ini! Gunakan `!serverstats` terlebih dahulu.');
    }

    const currentStatus = statsData[guildId].autoRestart;
    statsData[guildId].autoRestart = !currentStatus;
    
    fs.writeFileSync(statsDataPath, JSON.stringify(statsData, null, 2));

    const statusText = statsData[guildId].autoRestart ? 'ON' : 'OFF';
    const emoji = statsData[guildId].autoRestart ? '✅' : '❌';
    
    message.reply(`${emoji} **Auto restart server stats:** ${statusText}`);
  }
};