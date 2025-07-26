const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setup',
  description: 'Setup sistem create voice channel',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('Anda tidak memiliki izin untuk menggunakan command ini!');
    }

    const guildId = message.guild.id;
    const dataPath = path.join(__dirname, '..', '..', 'data', `${guildId}.json`);
    
    let guildData = {};
    if (fs.existsSync(dataPath)) {
      guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }

    try {
      const category = await message.guild.channels.create({
        name: 'Create Voice System',
        type: 4,
        permissionOverwrites: [
          {
            id: message.guild.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
          },
        ],
      });

      const textChannel = await message.guild.channels.create({
        name: 'voice-control',
        type: 0,
        parent: category.id,
        permissionOverwrites: [
          {
            id: message.guild.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
        ],
      });

      const voiceChannel = await message.guild.channels.create({
        name: '🎤 Create Voice',
        type: 2,
        parent: category.id,
        permissionOverwrites: [
          {
            id: message.guild.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
          },
        ],
      });

      guildData.createVoice = {
        categoryId: category.id,
        textChannelId: textChannel.id,
        voiceChannelId: voiceChannel.id,
        userChannels: {}
      };

      fs.writeFileSync(dataPath, JSON.stringify(guildData, null, 2));

      message.reply(`Setup berhasil!\nKategori: ${category.name}\nText Channel: ${textChannel}\nVoice Channel: ${voiceChannel}\n\nSekarang anggota dapat masuk ke voice channel untuk membuat channel pribadi mereka!`);
    } catch (error) {
      console.error('Error saat setup create voice:', error);
      message.reply('Terjadi kesalahan saat membuat setup create voice!');
    }
  }
};