const fs = require('fs');
const path = require('path');
const userKickStates = new Map();

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message) {
    if (message.author.bot) return;
    
    const guildId = message.guild?.id;
    if (!guildId) return;
    
    const dataPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
    
    if (!fs.existsSync(dataPath)) return;
    
    let guildData;
    try {
      guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
      return;
    }
    
    if (!guildData?.createVoice?.userChannels) return;
    
    const userId = message.author.id;
    const userChannel = guildData.createVoice.userChannels[userId];
    
    if (!userChannel?.channelId || message.channel.id !== guildData.createVoice.textChannelId) return;
    
    let voiceChannel;
    try {
      voiceChannel = await message.guild.channels.fetch(userChannel.channelId);
    } catch (error) {
      return;
    }
    
    if (!voiceChannel || voiceChannel.type !== 2) return;
    
    const voiceMembers = voiceChannel.members.filter(m => !m.user.bot);
    const ownerInVoice = voiceMembers.has(userId);
    
    if (!ownerInVoice) {
      if (userKickStates.has(userId)) {
        userKickStates.delete(userId);
      }
      return;
    }
    
    if (userKickStates.has(userId)) {
      const targetName = message.content.trim().toLowerCase();
      
      if (!targetName) {
        message.reply('❌ Silakan masukkan nama user yang ingin dikick!');
        userKickStates.delete(userId);
        return;
      }
      
      const targetMember = voiceMembers.find(m => {
        const displayName = m.displayName.toLowerCase();
        const username = m.user.username.toLowerCase();
        return (displayName.includes(targetName) || username.includes(targetName)) && m.id !== userId;
      });
      
      if (targetMember) {
        try {
          await targetMember.voice.disconnect('Dikeluarkan oleh owner channel');
          await message.reply(`👢 **${targetMember.displayName}** telah dikeluarkan dari voice channel Anda!`);
        } catch (error) {
          await message.reply(`❌ Gagal mengeluarkan **${targetMember.displayName}** dari voice channel!`);
        }
      } else {
        const availableUsers = voiceMembers
          .filter(m => m.id !== userId)
          .map(m => m.displayName)
          .join(', ');
        
        await message.reply(`❌ User dengan nama **${message.content.trim()}** tidak ditemukan di voice channel Anda!\n${availableUsers ? `Users yang tersedia: ${availableUsers}` : 'Tidak ada user lain di voice channel.'}`);
      }
      
      userKickStates.delete(userId);
      return;
    }
    
    if (message.content.toLowerCase().startsWith('kick ')) {
      const targetName = message.content.slice(5).trim().toLowerCase();
      
      if (!targetName) {
        return message.reply('❌ Silakan masukkan nama user yang ingin dikick!\nContoh: `kick namauser`');
      }
      
      const targetMember = voiceMembers.find(m => {
        const displayName = m.displayName.toLowerCase();
        const username = m.user.username.toLowerCase();
        return (displayName.includes(targetName) || username.includes(targetName)) && m.id !== userId;
      });
      
      if (targetMember) {
        try {
          await targetMember.voice.disconnect('Dikeluarkan oleh owner channel');
          await message.reply(`👢 **${targetMember.displayName}** telah dikeluarkan dari voice channel Anda!`);
        } catch (error) {
          await message.reply(`❌ Gagal mengeluarkan **${targetMember.displayName}** dari voice channel! Pastikan bot memiliki permission yang cukup.`);
        }
      } else {
        const availableUsers = voiceMembers
          .filter(m => m.id !== userId)
          .map(m => m.displayName)
          .join(', ');
        
        await message.reply(`❌ User dengan nama **${targetName}** tidak ditemukan di voice channel Anda!\n${availableUsers ? `Users yang tersedia: ${availableUsers}` : 'Tidak ada user lain di voice channel.'}`);
      }
    }
  }
};

module.exports.setKickState = (userId) => {
  userKickStates.set(userId, true);
  setTimeout(() => {
    userKickStates.delete(userId);
  }, 30000);
};