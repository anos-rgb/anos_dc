const fs = require('fs');
const path = require('path');

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
const commands = {};

for (const file of commandFiles) {
  const command = require(path.join(__dirname, '../commands', file));
  if (command.name) commands[command.name] = command;
}

module.exports = async (client, interaction) => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  try {
    if (interaction.isButton()) {
      const buttonId = interaction.customId;
      for (const [name, command] of Object.entries(commands)) {
        if (command.handleButtonInteraction && (buttonId.startsWith(name) || buttonId.includes(name))) {
          await command.handleButtonInteraction(interaction, client);
          return;
        }
      }
      if (buttonId.startsWith('change_vc_name')) {
        await interaction.showModal({
          title: 'Ubah Nama Channel',
          customId: 'change_vc_name',
          components: [{
            type: 1,
            components: [{
              type: 4,
              customId: 'new_name',
              label: 'Masukkan nama baru',
              style: 1,
              required: true,
            }]
          }]
        });
      } else if (buttonId.startsWith('set_vc_limit')) {
        await interaction.showModal({
          title: 'Atur Limit User',
          customId: 'set_vc_limit',
          components: [{
            type: 1,
            components: [{
              type: 4,
              customId: 'new_limit',
              label: 'Masukkan limit (0 untuk unlimited)',
              style: 1,
              required: true,
            }]
          }]
        });
      } else if (buttonId.startsWith('delete_channel')) {
        await interaction.deferUpdate();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const dataPath = path.join(__dirname, '..', '..', 'data', `${guildId}.json`);
        const guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const userChannel = guildData.createVoice.userChannels?.[userId];
        if (userChannel) {
          const channel = await interaction.guild.channels.fetch(userChannel.channelId);
          await channel.delete();
          delete guildData.createVoice.userChannels[userId];
          fs.writeFileSync(dataPath, JSON.stringify(guildData, null, 2));
          await interaction.followUp({ content: 'Channel telah dihapus', ephemeral: true });
        }
      }
    }

    if (interaction.isStringSelectMenu()) {
      const menuId = interaction.customId;
      if (menuId === 'voice_settings') {
        await interaction.deferUpdate();
        const value = interaction.values[0];
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const dataPath = path.join(__dirname, '..', '..', 'data', `${guildId}.json`);
        const guildData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const userChannel = guildData.createVoice.userChannels?.[userId];
        if (userChannel) {
          const channel = await interaction.guild.channels.fetch(userChannel.channelId);
          try {
            if (value === 'toggle_lock') {
              const isLocked = channel.permissionOverwrites.cache.some(overwrite => 
                overwrite.id === interaction.guild.id && overwrite.deny.has('Connect')
              );
              await channel.permissionOverwrites.edit(interaction.guild.id, {
                Connect: isLocked ? null : false
              });
              await interaction.followUp({ content: isLocked ? 'Channel telah dibuka' : 'Channel telah dikunci', ephemeral: true });
            } else if (value === 'toggle_visibility') {
              const isHidden = !channel.permissionOverwrites.cache.get(interaction.guild.id)?.allow?.has('ViewChannel');
              await channel.permissionOverwrites.edit(interaction.guild.id, {
                ViewChannel: isHidden ? true : null
              });
              await interaction.followUp({ content: isHidden ? 'Channel telah ditampilkan' : 'Channel telah disembunyikan', ephemeral: true });
            }
          } catch (error) {
            await interaction.followUp({ content: 'Gagal memproses permintaan', ephemeral: true });
          }
        }
      }
    }
  } catch (error) {
    await interaction.reply({ content: 'Terjadi kesalahan', ephemeral: true });
    console.error(error);
  }
};