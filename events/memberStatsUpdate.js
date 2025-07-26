const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'serverstats.json');

module.exports = [
  {
    name: 'guildMemberAdd',
    once: false,
    async execute(member) {
      await updateServerStats(member.guild);
    }
  },
  {
    name: 'guildMemberRemove', 
    once: false,
    async execute(member) {
      await updateServerStats(member.guild);
    }
  }
];

async function updateServerStats(guild) {
  try {
    if (!fs.existsSync(dataFilePath)) return;
    
    const statsData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    const guildId = guild.id;
    
    if (!statsData[guildId] || !statsData[guildId].categoryId) return;
    
    setTimeout(async () => {
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
      
    }, 1000);
    
  } catch (error) {
    console.error(`Error dalam memperbarui server stats: ${error.message}`);
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