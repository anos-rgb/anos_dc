const fs = require('fs');
const path = require('path');
const {
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonStyle,
  MessageFlags,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ChannelType
} = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    if (!interaction.guild) return;
    
    const guildId = interaction.guild.id;
    const dataPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
    const userId = interaction.user.id;
    
    const balasAman = async (options) => {
      try {
        if (interaction.replied || interaction.deferred) {
          return await interaction.followUp(options);
        }
        return await interaction.reply(options);
      } catch (err) {
        console.error('Error saat membalas:', err);
      }
    };
    
    const tombolBukanMilikmu = () => balasAman({ 
      content: '❌ Ini bukan tombol untukmu!',
      flags: MessageFlags.Ephemeral 
    });

    if (interaction.isButton()) {
      return await handleButtonInteraction(interaction, client, balasAman, tombolBukanMilikmu);
    }
    
    if (interaction.isStringSelectMenu()) {
      return await handleSelectMenuInteraction(interaction, client, balasAman, tombolBukanMilikmu);
    }
    
    if (interaction.isModalSubmit()) {
      return await handleModalSubmit(interaction, client, balasAman);
    }
    
    if (interaction.isUserSelectMenu()) {
      return await handleUserSelectMenu(interaction, client, balasAman, tombolBukanMilikmu);
    }
    
    if (interaction.isRoleSelectMenu()) {
      return await handleRoleSelectMenu(interaction, client, balasAman, tombolBukanMilikmu);
    }
    
    if (interaction.isChannelSelectMenu()) {
      return await handleChannelSelectMenu(interaction, client, balasAman, tombolBukanMilikmu);
    }
    
    if (interaction.isMentionableSelectMenu()) {
      return await handleMentionableSelectMenu(interaction, client, balasAman, tombolBukanMilikmu);
    }
  }
};

async function handleButtonInteraction(interaction, client, balasAman, tombolBukanMilikmu) {
  const { customId, user } = interaction;
  const userId = user.id;
  
  const voiceHandlers = await handleVoiceChannelButtons(interaction, balasAman, tombolBukanMilikmu);
  if (voiceHandlers) return voiceHandlers;
  
  const gameHandlers = await handleGameButtons(interaction, balasAman, tombolBukanMilikmu);
  if (gameHandlers) return gameHandlers;
  
  const adminHandlers = await handleAdminButtons(interaction, balasAman, tombolBukanMilikmu);
  if (adminHandlers) return adminHandlers;
  
  return await handleGenericButton(interaction, client, balasAman, tombolBukanMilikmu);
}

async function handleVoiceChannelButtons(interaction, balasAman, tombolBukanMilikmu) {
  const { customId, user, guild } = interaction;
  const userId = user.id;
  
  const voiceButtons = [
    'delete_channel', 'refresh_info', 'clone_permissions',
    'confirm_delete', 'cancel_delete'
  ];
  
  if (!voiceButtons.some(btn => customId.includes(btn))) return null;
  
  const guildId = guild.id;
  const dataPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
  
  if (!fs.existsSync(dataPath)) {
    return balasAman({ content: '❌ Data server tidak ditemukan!', flags: MessageFlags.Ephemeral });
  }
  
  let guildData;
  try {
    guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    return balasAman({ content: '❌ Error membaca data server!', flags: MessageFlags.Ephemeral });
  }
  
  const userChannel = guildData?.createVoice?.userChannels?.[userId];
  if (!userChannel) {
    return balasAman({ content: '❌ Anda tidak memiliki voice channel!', flags: MessageFlags.Ephemeral });
  }
  
  try {
    const channel = await guild.channels.fetch(userChannel.channelId);
    
    if (customId === 'delete_channel') {
      const confirmEmbed = new EmbedBuilder()
        .setTitle('⚠️ Konfirmasi Hapus Channel')
        .setDescription(`Apakah Anda yakin ingin menghapus voice channel **${channel.name}**?\n\n⚠️ **Tindakan ini tidak dapat dibatalkan!**`)
        .setColor('#ff6b6b');
      
      const confirmButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_delete')
            .setLabel('Ya, Hapus')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️'),
          new ButtonBuilder()
            .setCustomId('cancel_delete')
            .setLabel('Batal')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❌')
        );
      
      return await interaction.update({
        embeds: [confirmEmbed],
        components: [confirmButtons]
      });
    }
    
    if (customId === 'confirm_delete') {
      await channel.delete('Voice channel dihapus oleh owner');
      delete guildData.createVoice.userChannels[userId];
      fs.writeFileSync(dataPath, JSON.stringify(guildData, null, 2));
      
      return balasAman({
        content: '✅ Voice channel berhasil dihapus!',
        flags: MessageFlags.Ephemeral
      });
    }
    
    if (customId === 'cancel_delete') {
      const cmd = require('../commands/menubot/myvc.js');
      const fakeMessage = {
        author: user,
        guild: guild,
        reply: interaction.update.bind(interaction)
      };
      return await cmd.execute(fakeMessage, []);
    }
    
    if (customId === 'refresh_info') {
      const cmd = require('../commands/menubot/myvc.js');
      const fakeMessage = {
        author: user,
        guild: guild,
        reply: interaction.update.bind(interaction)
      };
      return await cmd.execute(fakeMessage, []);
    }
    
    if (customId === 'clone_permissions') {
      return balasAman({
        content: '🔄 Fitur clone permissions sedang dalam pengembangan!',
        flags: MessageFlags.Ephemeral
      });
    }
    
  } catch (error) {
    console.error('Voice channel button error:', error);
    return balasAman({
      content: '❌ Terjadi kesalahan saat memproses voice channel!',
      flags: MessageFlags.Ephemeral
    });
  }
  
  return true;
}

async function handleGameButtons(interaction, balasAman, tombolBukanMilikma) {
  const { customId, user } = interaction;
  const userId = user.id;
  
  const gameHandlers = {
    megaslot_: () => {
      const [_, bet, uid] = customId.split('_');
      if (userId !== uid) return tombolBukanMilikma();
      return executeCommand('../commands/game/megaslot.js', 'megaslot', [bet], interaction, user);
    },
    
    duelcoin_: () => {
      const parts = customId.split('_');
      const uid = parts.pop();
      if (userId !== uid) return tombolBukanMilikma();
      const harusUpdate = ['heads', 'tails'].includes(parts[1]);
      return executeCommand('../commands/game/duelcoin.js', 'duelcoin', parts.slice(1), interaction, user, harusUpdate);
    },
    
    slot_: () => {
      const [_, bet, uid] = customId.split('_');
      if (userId !== uid) return tombolBukanMilikma();
      return executeCommand('../commands/game/slot.js', 'slot', [bet], interaction, user);
    },
    
    blackjack_: () => {
      const parts = customId.split('_');
      const uid = parts.pop();
      if (userId !== uid) return tombolBukanMilikma();
      return executeCommand('../commands/game/blackjack.js', 'blackjack', parts.slice(1), interaction, user, true);
    }
  };
  
  const prefix = customId.split('_')[0];
  if (gameHandlers[prefix + '_']) {
    return await gameHandlers[prefix + '_']();
  }
  
  return null;
}

async function handleAdminButtons(interaction, balasAman, tombolBukanMilikmu) {
  const { customId, user, member } = interaction;
  
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    if (customId.includes('admin_') || customId.includes('setup_') || customId.includes('config_')) {
      return balasAman({
        content: '❌ Anda tidak memiliki permission untuk menggunakan tombol ini!',
        flags: MessageFlags.Ephemeral
      });
    }
  }
  
  const adminButtons = ['setup_voice', 'setup_economy', 'setup_moderation', 'config_server'];
  if (adminButtons.some(btn => customId.includes(btn))) {
    return executeCommand('../commands/admin/setup.js', 'setup', [customId.split('_')[1]], interaction, user);
  }
  
  return null;
}

async function handleSelectMenuInteraction(interaction, client, balasAman, tombolBukanMilikmu) {
  const { customId, values, user } = interaction;
  const userId = user.id;
  
  if (customId === 'voice_settings') {
    return await handleVoiceSettings(interaction, balasAman, tombolBukanMilikmu);
  }
  
  if (customId === 'admin_menu') {
    return await handleAdminMenu(interaction, balasAman, tombolBukanMilikmu);
  }
  
  if (customId === 'game_menu') {
    return await handleGameMenu(interaction, balasAman, tombolBukanMilikmu);
  }
  
  if (customId === 'economy_menu') {
    return await handleEconomyMenu(interaction, balasAman, tombolBukanMilikmu);
  }
  
  return await handleGenericSelectMenu(interaction, client, balasAman, tombolBukanMilikmu);
}

async function handleVoiceSettings(interaction, balasAman, tombolBukanMilikmu) {
  const { values, user, guild } = interaction;
  const userId = user.id;
  const selectedValue = values[0];
  
  const guildId = guild.id;
  const dataPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
  
  if (!fs.existsSync(dataPath)) {
    return balasAman({ content: '❌ Data server tidak ditemukan!', flags: MessageFlags.Ephemeral });
  }
  
  const guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const userChannel = guildData?.createVoice?.userChannels?.[userId];
  
  if (!userChannel) {
    return balasAman({ content: '❌ Anda tidak memiliki voice channel!', flags: MessageFlags.Ephemeral });
  }
  
  try {
    const channel = await guild.channels.fetch(userChannel.channelId);
    
    if (selectedValue === 'change_name') {
      const modal = new ModalBuilder()
        .setCustomId('change_voice_name')
        .setTitle('Ubah Nama Voice Channel');
      
      const nameInput = new TextInputBuilder()
        .setCustomId('voice_name_input')
        .setLabel('Nama Channel Baru')
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(100)
        .setPlaceholder('Masukkan nama channel baru...')
        .setValue(channel.name);
      
      modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
      return await interaction.showModal(modal);
    }
    
    if (selectedValue === 'set_limit') {
      const modal = new ModalBuilder()
        .setCustomId('set_voice_limit')
        .setTitle('Atur Limit User');
      
      const limitInput = new TextInputBuilder()
        .setCustomId('voice_limit_input')
        .setLabel('Limit User (0 = unlimited)')
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(2)
        .setPlaceholder('0-99')
        .setValue(channel.userLimit.toString());
      
      modal.addComponents(new ActionRowBuilder().addComponents(limitInput));
      return await interaction.showModal(modal);
    }
    
    if (selectedValue === 'toggle_lock') {
      const everyoneOverwrite = channel.permissionOverwrites.cache.get(guild.id);
      const isLocked = everyoneOverwrite?.deny?.has(PermissionFlagsBits.Connect);
      
      if (isLocked) {
        await channel.permissionOverwrites.edit(guild.id, {
          Connect: null
        });
        await interaction.update({ content: '🔓 Voice channel berhasil di-unlock!', components: [], embeds: [] });
      } else {
        await channel.permissionOverwrites.edit(guild.id, {
          Connect: false
        });
        await interaction.update({ content: '🔒 Voice channel berhasil di-lock!', components: [], embeds: [] });
      }
    }
    
    if (selectedValue === 'toggle_visibility') {
      const everyoneOverwrite = channel.permissionOverwrites.cache.get(guild.id);
      const isHidden = everyoneOverwrite?.deny?.has(PermissionFlagsBits.ViewChannel);
      
      if (isHidden) {
        await channel.permissionOverwrites.edit(guild.id, {
          ViewChannel: null
        });
        await interaction.update({ content: '👁️ Voice channel sekarang visible!', components: [], embeds: [] });
      } else {
        await channel.permissionOverwrites.edit(guild.id, {
          ViewChannel: false
        });
        await interaction.update({ content: '🙈 Voice channel sekarang hidden!', components: [], embeds: [] });
      }
    }
    
    if (selectedValue === 'kick_user') {
      const { setKickState } = require('../events/messageCreate.js');
      setKickState(userId);
      
      const members = channel.members.filter(m => m.id !== userId && !m.user.bot);
      const memberList = members.map(m => `• ${m.displayName}`).join('\n') || 'Tidak ada user lain';
      
      return balasAman({
        content: `👢 **Mode Kick User Aktif!**\n\nKetik nama user yang ingin dikick di chat ini.\n\n**Users di channel:**\n${memberList}\n\n*Mode ini akan otomatis nonaktif dalam 30 detik.*`,
        flags: MessageFlags.Ephemeral
      });
    }
    
    if (selectedValue === 'transfer_ownership') {
      const members = channel.members.filter(m => m.id !== userId && !m.user.bot);
      
      if (members.size === 0) {
        return balasAman({
          content: '❌ Tidak ada user lain di voice channel untuk transfer ownership!',
          flags: MessageFlags.Ephemeral
        });
      }
      
      const userSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_new_owner')
        .setPlaceholder('Pilih user untuk menjadi owner baru')
        .addOptions(
          members.map(member => ({
            label: member.displayName,
            description: `Transfer ownership ke ${member.user.username}`,
            value: member.id,
            emoji: '👑'
          }))
        );
      
      const row = new ActionRowBuilder().addComponents(userSelectMenu);
      
      return await interaction.update({
        content: '👑 **Transfer Ownership**\n\nPilih user yang akan menjadi owner baru:',
        components: [row],
        embeds: []
      });
    }
    
  } catch (error) {
    console.error('Voice settings error:', error);
    return balasAman({
      content: '❌ Terjadi kesalahan saat memproses pengaturan!',
      flags: MessageFlags.Ephemeral
    });
  }
  
  setTimeout(async () => {
    try {
      const cmd = require('../commands/menubot/myvc.js');
      const fakeMessage = {
        author: user,
        guild: guild,
        reply: interaction.editReply.bind(interaction)
      };
      await cmd.execute(fakeMessage, []);
    } catch (error) {
      console.error('Error refreshing voice settings:', error);
    }
  }, 3000);
}

async function handleModalSubmit(interaction, client, balasAman) {
  const { customId, fields, user, guild } = interaction;
  const userId = user.id;
  
  if (customId === 'change_voice_name') {
    const newName = fields.getTextInputValue('voice_name_input');
    
    const guildId = guild.id;
    const dataPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
    const guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const userChannel = guildData?.createVoice?.userChannels?.[userId];
    
    if (!userChannel) {
      return balasAman({ content: '❌ Voice channel tidak ditemukan!', flags: MessageFlags.Ephemeral });
    }
    
    try {
      const channel = await guild.channels.fetch(userChannel.channelId);
      await channel.setName(newName);
      
      return balasAman({
        content: `✅ Nama voice channel berhasil diubah menjadi **${newName}**!`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      return balasAman({
        content: '❌ Gagal mengubah nama channel! Pastikan nama valid.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
  
  if (customId === 'set_voice_limit') {
    const limitStr = fields.getTextInputValue('voice_limit_input');
    const limit = parseInt(limitStr);
    
    if (isNaN(limit) || limit < 0 || limit > 99) {
      return balasAman({
        content: '❌ Limit harus berupa angka 0-99!',
        flags: MessageFlags.Ephemeral
      });
    }
    
    const guildId = guild.id;
    const dataPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
    const guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const userChannel = guildData?.createVoice?.userChannels?.[userId];
    
    if (!userChannel) {
      return balasAman({ content: '❌ Voice channel tidak ditemukan!', flags: MessageFlags.Ephemeral });
    }
    
    try {
      const channel = await guild.channels.fetch(userChannel.channelId);
      await channel.setUserLimit(limit);
      
      return balasAman({
        content: `✅ Limit user berhasil diatur menjadi ${limit === 0 ? 'unlimited' : limit}!`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      return balasAman({
        content: '❌ Gagal mengatur limit user!',
        flags: MessageFlags.Ephemeral
      });
    }
  }
}

async function handleGenericButton(interaction, client, balasAman, tombolBukanMilikmu) {
  const { customId, user } = interaction;
  const userId = user.id;
  
  let cmdPath = null;
  let args = [];
  let cmdName = '';
  let harusUpdate = false;
  
  const folders = ['game', 'admin', 'ekonomi', 'toko', 'menubot', 'moderation', 'random', 'fun'];
  const prefix = customId.split('_')[0];
  
  for (const folder of folders) {
    const cekPath = `../commands/${folder}/${prefix}.js`;
    if (fs.existsSync(path.resolve(__dirname, cekPath))) {
      cmdPath = cekPath;
      cmdName = prefix;
      const bagian = customId.split('_');
      const terakhir = bagian.at(-1);
      
      if (/^\d{17,19}$/.test(terakhir)) {
        if (userId !== terakhir) return tombolBukanMilikmu();
        args = bagian.slice(1, -1);
      } else {
        args = bagian.slice(1);
      }
      break;
    }
  }
  
  if (!cmdPath) {
    return balasAman({ 
      content: '❌ Tombol tidak dikenali!',
      flags: MessageFlags.Ephemeral 
    });
  }
  
  return await executeCommand(cmdPath, cmdName, args, interaction, user, harusUpdate);
}

async function handleGenericSelectMenu(interaction, client, balasAman, tombolBukanMilikmu) {
  const { customId, values, user } = interaction;
  
  return balasAman({
    content: `🔧 Select menu **${customId}** belum diimplementasikan!\nValue: ${values.join(', ')}`,
    flags: MessageFlags.Ephemeral
  });
}

async function handleUserSelectMenu(interaction, client, balasAman, tombolBukanMilikmu) {
  const { customId, values, user } = interaction;
  
  return balasAman({
    content: `👥 User select menu **${customId}** belum diimplementasikan!`,
    flags: MessageFlags.Ephemeral
  });
}

async function handleRoleSelectMenu(interaction, client, balasAman, tombolBukanMilikmu) {
  const { customId, values, user } = interaction;
  
  return balasAman({
    content: `🎭 Role select menu **${customId}** belum diimplementasikan!`,
    flags: MessageFlags.Ephemeral
  });
}

async function handleChannelSelectMenu(interaction, client, balasAman, tombolBukanMilikmu) {
  const { customId, values, user } = interaction;
  
  return balasAman({
    content: `📺 Channel select menu **${customId}** belum diimplementasikan!`,
    flags: MessageFlags.Ephemeral
  });
}

async function handleMentionableSelectMenu(interaction, client, balasAman, tombolBukanMilikmu) {
  const { customId, values, user } = interaction;
  
  return balasAman({
    content: `🏷️ Mentionable select menu **${customId}** belum diimplementasikan!`,
    flags: MessageFlags.Ephemeral
  });
}

async function executeCommand(cmdPath, cmdName, args, interaction, user, harusUpdate = false) {
  try {
    delete require.cache[require.resolve(cmdPath)];
    const cmd = require(cmdPath);
    
    if (!cmd || typeof cmd.execute !== 'function') {
      return interaction.reply({ 
        content: '❌ Command tidak valid!',
        flags: MessageFlags.Ephemeral 
      });
    }
    
    const balasAman = async (options) => {
      try {
        if (interaction.replied || interaction.deferred) {
          return await interaction.followUp(options);
        }
        return await interaction.reply(options);
      } catch (err) {
        console.error('Error saat membalas:', err);
      }
    };
    
    const pesanPalsu = {
      author: user,
      channel: interaction.channel,
      guild: interaction.guild,
      member: interaction.member,
      content: `!${cmdName} ${args.join(' ')}`.trim(),
      reply: harusUpdate ? interaction.update.bind(interaction) : balasAman
    };
    
    await cmd.execute(pesanPalsu, args, interaction.client);
    return true;
  } catch (error) {
    console.error(`Error executing command ${cmdName}:`, error);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: '❌ Terjadi error saat menjalankan command!', 
          flags: MessageFlags.Ephemeral 
        });
      }
    } catch (replyError) {
      console.error('Error replying to interaction:', replyError);
    }
    return false;
  }
}