const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Bot ${client.user.tag} sudah online!`);
    
    await cleanupOrphanedChannels(client);
    
    initializeServerStats(client);
    
    setInterval(async () => {
      await cleanupOrphanedChannels(client);
    }, 5 * 60 * 1000);
  }
};

async function cleanupOrphanedChannels(client) {
  try {
    const guilds = client.guilds.cache.values();
    
    for (const guild of guilds) {
      const guildId = guild.id;
      const dataPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
      
      if (!fs.existsSync(dataPath)) continue;
      
      const guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      if (!guildData.createVoice || !guildData.createVoice.userChannels) continue;
      
      const userChannels = guildData.createVoice.userChannels;
      let hasChanges = false;
      
      for (const [userId, channelData] of Object.entries(userChannels)) {
        const channel = await guild.channels.fetch(channelData.channelId).catch(() => null);
        
        if (!channel || channel.members.size === 0) {
          if (channel) {
            await channel.delete().catch(console.error);
          }
          delete guildData.createVoice.userChannels[userId];
          hasChanges = true;
          console.log(`Membersihkan channel kosong untuk user ${userId} di guild ${guild.name}`);
        }
      }
      
      if (hasChanges) {
        fs.writeFileSync(dataPath, JSON.stringify(guildData, null, 2));
      }
    }
    
    const statsDataPath = path.join(__dirname, '..', 'data', 'serverstats.json');
    if (fs.existsSync(statsDataPath)) {
      const statsData = JSON.parse(fs.readFileSync(statsDataPath, 'utf8'));
      
      for (const [guildId, data] of Object.entries(statsData)) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;
        
        if (data.autoRestart) {
          await updateServerStats(guild);
        }
      }
    }
  } catch (error) {
    console.error('Error saat cleanup channels:', error);
  }
}

function initializeServerStats(client) {
  try {
    const serverStatsCommand = require('../commands/moderation/serverstats.js');
    if (serverStatsCommand && typeof serverStatsCommand.startAutoRestarts === 'function') {
      serverStatsCommand.startAutoRestarts(client);
      console.log('Server stats auto-restart telah diinisialisasi');
    }
  } catch (error) {
    console.error('Error saat inisialisasi server stats:', error);
  }
}

async function updateServerStats(guild) {
  try {
    const statsDataPath = path.join(__dirname, '..', 'data', 'serverstats.json');
    if (!fs.existsSync(statsDataPath)) return;
    
    const statsData = JSON.parse(fs.readFileSync(statsDataPath, 'utf8'));
    const guildId = guild.id;
    
    if (!statsData[guildId] || !statsData[guildId].categoryId) return;
    
    await guild.members.fetch().catch(() => {});
    
    const stats = calculateStats(guild);
    const channelIds = statsData[guildId].channels;
    
    const updatePromises = [];
    
    if (channelIds.all) {
      updatePromises.push(updateChannelName(guild, channelIds.all, `👥 All Members: ${stats.total}`));
    }
    
    if (channelIds.members) {
      updatePromises.push(updateChannelName(guild, channelIds.members, `👤 Members: ${stats.humans}`));
    }
    
    if (channelIds.bots) {
      updatePromises.push(updateChannelName(guild, channelIds.bots, `🤖 Bots: ${stats.bots}`));
    }
    
    await Promise.allSettled(updatePromises);
    
  } catch (error) {
    console.error(`Error dalam memperbarui server stats untuk guild ${guild.name}: ${error.message}`);
  }
}

async function updateChannelName(guild, channelId, newName) {
  try {
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (channel && channel.name !== newName) {
      await channel.setName(newName);
    }
  } catch (error) {
    if (error.code !== 50013 && error.code !== 50035) {
      console.error(`Error mengubah nama channel ${channelId}: ${error.message}`);
    }
  }
}

function calculateStats(guild) {
  const totalMembers = guild.memberCount;
  const botCount = guild.members.cache.filter(member => member.user.bot).size;
  const humanCount = totalMembers - botCount;
  
  return {
    total: totalMembers,
    humans: humanCount,
    bots: botCount
  };
}