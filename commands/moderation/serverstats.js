const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', '..', 'data', 'serverstats.json');
const AUTO_RESTART_INTERVAL = 60000;
const autoRestartTimers = {};

module.exports = {
  name: 'serverstats',
  description: 'Buat atau kelola channel statistik server',
  aliases: ['stats', 'serverstat'],
  cooldown: 5,
  permissions: [PermissionFlagsBits.ManageGuild],
  botPermissions: [PermissionFlagsBits.ManageChannels],
  
  async execute(message, args) {
    try {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('Kamu tidak memiliki izin untuk menggunakan perintah ini!');
      }

      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('Bot tidak memiliki izin untuk mengelola channel!');
      }

      const subcommand = args[0]?.toLowerCase();
      
      if (!subcommand) {
        return message.reply('Gunakan: `!serverstats create|restart|reset|autorestart`\n\n**Perintah yang tersedia:**\n• `!serverstats create` - Buat channel statistik baru\n• `!serverstats restart` - Perbarui statistik tanpa membuat ulang\n• `!serverstats reset` - Hapus semua channel statistik\n• `!serverstats autorestart on/off` - Aktifkan/nonaktifkan auto restart');
      }

      if (!fs.existsSync(path.dirname(dataFilePath))) {
        fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
      }
      
      const guild = message.guild;
      
      let statsData = {};
      if (fs.existsSync(dataFilePath)) {
        statsData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      }
      
      const guildId = guild.id;
      if (!statsData[guildId]) {
        statsData[guildId] = {
          categoryId: null,
          channels: {
            all: null,
            members: null,
            bots: null
          },
          autoRestart: false
        };
      }
      
      if (statsData[guildId].autoRestart === undefined) {
        statsData[guildId].autoRestart = false;
      }
      
      switch (subcommand) {
        case 'create':
        case 'buat':
          await createStats(message, guild, statsData, guildId);
          if (statsData[guildId].autoRestart) {
            setupAutoRestart(guild, statsData, guildId);
          }
          break;
        case 'restart':
        case 'refresh':
        case 'update':
          await restartStats(message, guild, statsData, guildId);
          break;
        case 'reset':
        case 'hapus':
        case 'delete':
          await resetStats(message, guild, statsData, guildId);
          if (autoRestartTimers[guildId]) {
            clearInterval(autoRestartTimers[guildId]);
            delete autoRestartTimers[guildId];
          }
          break;
        case 'autorestart':
        case 'auto':
          const enableOption = args[1]?.toLowerCase();
          if (!enableOption || (enableOption !== 'on' && enableOption !== 'off' && enableOption !== 'aktif' && enableOption !== 'nonaktif')) {
            return message.reply('Gunakan: `!serverstats autorestart on/off`');
          }
          const enableAutoRestart = enableOption === 'on' || enableOption === 'aktif';
          await toggleAutoRestart(message, guild, statsData, guildId, enableAutoRestart);
          break;
        default:
          message.reply('Perintah tidak dikenali! Gunakan: `!serverstats create|restart|reset|autorestart`');
      }
    } catch (error) {
      console.error(`Error dalam menjalankan serverstats: ${error}`);
      message.reply(`Terjadi kesalahan: ${error.message}`);
    }
  },
  
  startAutoRestarts(client) {
    if (!fs.existsSync(dataFilePath)) return;
    
    try {
      const statsData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      
      for (const [guildId, guildData] of Object.entries(statsData)) {
        if (guildData.autoRestart) {
          const guild = client.guilds.cache.get(guildId);
          if (guild) {
            setupAutoRestart(guild, statsData, guildId);
            console.log(`Auto restart serverstats diaktifkan untuk guild: ${guild.name}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error saat memulai auto restarts: ${error}`);
    }
  }
};

async function createStats(message, guild, statsData, guildId) {
  const loadingMsg = await message.reply('Sedang membuat channel statistik server...');
  
  await removeOldStats(guild, statsData[guildId]);
  
  const category = await guild.channels.create({
    name: '📊 SERVER STATISTICS',
    type: 4,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.Connect]
      }
    ]
  });
  
  const stats = calculateStats(guild);
  
  const allMembersChannel = await guild.channels.create({
    name: `👥 All Members: ${stats.total}`,
    type: 2,
    parent: category.id,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.Connect]
      }
    ]
  });
  
  const membersChannel = await guild.channels.create({
    name: `👤 Members: ${stats.humans}`,
    type: 2,
    parent: category.id,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.Connect]
      }
    ]
  });
  
  const botsChannel = await guild.channels.create({
    name: `🤖 Bots: ${stats.bots}`,
    type: 2,
    parent: category.id,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.Connect]
      }
    ]
  });
  
  statsData[guildId] = {
    categoryId: category.id,
    channels: {
      all: allMembersChannel.id,
      members: membersChannel.id,
      bots: botsChannel.id
    },
    autoRestart: statsData[guildId].autoRestart || false
  };
  
  fs.writeFileSync(dataFilePath, JSON.stringify(statsData, null, 2));
  
  await loadingMsg.edit('Channel statistik server berhasil dibuat!');
}

async function restartStats(message, guild, statsData, guildId) {
  const guildData = statsData[guildId];
  
  if (!guildData.categoryId) {
    return message.reply('Tidak ada channel statistik yang dibuat. Gunakan `!serverstats create` terlebih dahulu.');
  }
  
  let loadingMsg;
  if (message) {
    loadingMsg = await message.reply('Sedang memperbarui statistik server...');
  }
  
  const stats = calculateStats(guild);
  
  for (const [type, channelId] of Object.entries(guildData.channels)) {
    if (channelId) {
      const channel = guild.channels.cache.get(channelId);
      if (channel) {
        try {
          switch (type) {
            case 'all':
              await channel.setName(`👥 All Members: ${stats.total}`);
              break;
            case 'members':
              await channel.setName(`👤 Members: ${stats.humans}`);
              break;
            case 'bots':
              await channel.setName(`🤖 Bots: ${stats.bots}`);
              break;
          }
        } catch (error) {
          console.error(`Error updating ${type} channel: ${error}`);
        }
      }
    }
  }
  
  if (loadingMsg) {
    await loadingMsg.edit('Channel statistik server berhasil diperbarui!');
  }
}

async function resetStats(message, guild, statsData, guildId) {
  const guildData = statsData[guildId];
  
  if (!guildData.categoryId) {
    return message.reply('Tidak ada channel statistik yang perlu dihapus.');
  }
  
  const loadingMsg = await message.reply('Sedang menghapus channel statistik...');
  
  await removeOldStats(guild, guildData);
  
  delete statsData[guildId];
  
  fs.writeFileSync(dataFilePath, JSON.stringify(statsData, null, 2));
  
  await loadingMsg.edit('Channel statistik server berhasil dihapus!');
}

async function removeOldStats(guild, guildData) {
  if (guildData.categoryId) {
    for (const channelId of Object.values(guildData.channels)) {
      if (channelId) {
        const channel = guild.channels.cache.get(channelId);
        if (channel) await channel.delete().catch(console.error);
      }
    }
    
    const category = guild.channels.cache.get(guildData.categoryId);
    if (category) await category.delete().catch(console.error);
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

async function toggleAutoRestart(message, guild, statsData, guildId, enable) {
  statsData[guildId].autoRestart = enable;
  
  fs.writeFileSync(dataFilePath, JSON.stringify(statsData, null, 2));
  
  if (enable) {
    setupAutoRestart(guild, statsData, guildId);
    await message.reply('Auto restart statistik server setiap 1 menit telah diaktifkan!');
  } else {
    if (autoRestartTimers[guildId]) {
      clearInterval(autoRestartTimers[guildId]);
      delete autoRestartTimers[guildId];
    }
    await message.reply('Auto restart statistik server telah dinonaktifkan!');
  }
}

function setupAutoRestart(guild, statsData, guildId) {
  if (autoRestartTimers[guildId]) {
    clearInterval(autoRestartTimers[guildId]);
  }
  
  autoRestartTimers[guildId] = setInterval(async () => {
    try {
      let currentStatsData = {};
      if (fs.existsSync(dataFilePath)) {
        currentStatsData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      }
      
      if (currentStatsData[guildId] && 
          currentStatsData[guildId].autoRestart && 
          currentStatsData[guildId].categoryId) {
        await restartStats(null, guild, currentStatsData, guildId);
        console.log(`Auto restart serverstats untuk guild ${guild.name} (${guildId}) berhasil dijalankan`);
      } else {
        clearInterval(autoRestartTimers[guildId]);
        delete autoRestartTimers[guildId];
        console.log(`Auto restart serverstats untuk guild ${guild.name} (${guildId}) dihentikan karena konfigurasi diubah`);
      }
    } catch (error) {
      console.error(`Error dalam auto restart serverstats untuk guild ${guildId}: ${error}`);
    }
  }, AUTO_RESTART_INTERVAL);
  
  console.log(`Auto restart serverstats diaktifkan untuk guild ${guild.name} (${guildId}) setiap ${AUTO_RESTART_INTERVAL/1000} detik`);
}