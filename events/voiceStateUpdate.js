const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  async execute(oldState, newState) {
    const guildId = newState.guild.id;
    const dataPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
    
    if (!fs.existsSync(dataPath)) return;
    
    const guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    if (!guildData.createVoice) return;

    const userId = newState.member.id;
    const createVoiceId = guildData.createVoice.voiceChannelId;
    
    if (newState.channelId === createVoiceId) {
      try {
        const category = await newState.guild.channels.fetch(guildData.createVoice.categoryId);
        
        const userChannel = await newState.guild.channels.create({
          name: `${newState.member.displayName}'s Voice`,
          type: 2,
          parent: category.id,
          permissionOverwrites: [
            {
              id: newState.guild.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
            },
            {
              id: userId,
              allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers],
            },
          ],
        });

        await newState.member.voice.setChannel(userChannel);
        
        guildData.createVoice.userChannels[userId] = {
          channelId: userChannel.id,
          ownerId: userId,
          createdAt: Date.now()
        };
        
        fs.writeFileSync(dataPath, JSON.stringify(guildData, null, 2));
        
        const textChannel = await newState.guild.channels.fetch(guildData.createVoice.textChannelId);
        if (textChannel) {
          textChannel.send(`🎤 **${newState.member.displayName}** telah membuat voice channel pribadi! Gunakan \`!myvc\` untuk mengatur channel Anda.`);
        }
        
      } catch (error) {
        console.error('Error saat membuat voice channel:', error);
      }
    }
    
    if (oldState.channelId && oldState.channelId !== createVoiceId) {
      const userChannels = guildData.createVoice.userChannels;
      
      for (const [ownerId, channelData] of Object.entries(userChannels)) {
        if (channelData.channelId === oldState.channelId) {
          const channel = await newState.guild.channels.fetch(channelData.channelId).catch(() => null);
          
          if (channel && channel.members.size === 0) {
            await channel.delete().catch(console.error);
            delete guildData.createVoice.userChannels[ownerId];
            fs.writeFileSync(dataPath, JSON.stringify(guildData, null, 2));
            
            const textChannel = await newState.guild.channels.fetch(guildData.createVoice.textChannelId);
            if (textChannel) {
              textChannel.send(`🗑️ Voice channel milik **${newState.guild.members.cache.get(ownerId)?.displayName || 'Unknown'}** telah dihapus karena kosong.`);
            }
          }
          break;
        }
      }
    }
  }
};