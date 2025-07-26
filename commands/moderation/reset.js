const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');

const statsDataPath = path.join(__dirname, '..', 'data', 'serverstats.json');

module.exports = {
  name: 'reset',
  description: 'Menghapus server stats',
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
      return message.reply('Server stats tidak aktif di server ini!');
    }

    try {
      const channelIds = statsData[guildId].channels;
      const categoryId = statsData[guildId].categoryId;
      
      if (channelIds.all) {
        const allChannel = await message.guild.channels.fetch(channelIds.all).catch(() => null);
        if (allChannel) await allChannel.delete().catch(console.error);
      }
      
      if (channelIds.members) {
        const membersChannel = await message.guild.channels.fetch(channelIds.members).catch(() => null);
        if (membersChannel) await membersChannel.delete().catch(console.error);
      }
      
      if (channelIds.bots) {
        const botsChannel = await message.guild.channels.fetch(channelIds.bots).catch(() => null);
        if (botsChannel) await botsChannel.delete().catch(console.error);
      }
      
      if (categoryId) {
        const category = await message.guild.channels.fetch(categoryId).catch(() => null);
        if (category) await category.delete().catch(console.error);
      }
      
      delete statsData[guildId];
      fs.writeFileSync(statsDataPath, JSON.stringify(statsData, null, 2));
      
      message.reply('🗑️ **Server stats berhasil dihapus!**');
    } catch (error) {
      console.error('Error saat menghapus server stats:', error);
      message.reply('❌ Terjadi kesalahan saat menghapus server stats!');
    }
  }
};