const fs = require('fs');
const path = require('path');
const {
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    if (!interaction.isButton()) {
      if (interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
        const guildId = interaction.guild.id;
        const dataPath = path.join(__dirname, '..', 'data', `${guildId}.json`);
        return;
      }
      return;
    }

    const { customId, user } = interaction;
    const userId = user.id;

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

    const tombolBukanMilikmu = () =>
      balasAman({
        content: 'Ini bukan tombol untukmu!',
        flags: MessageFlags.Ephemeral
      });

    let cmdPath = null;
    let args = [];
    let cmdName = '';
    let harusUpdate = false;

    const penanganTombol = {
      megaslot_: () => {
        const [_, bet, uid] = customId.split('_');
        if (userId !== uid) return tombolBukanMilikmu();
        cmdPath = '../commands/game/megaslot.js';
        args = [bet];
        cmdName = 'megaslot';
      },

      duelcoin_: () => {
        const p = customId.split('_');
        const uid = p.pop();
        if (userId !== uid) return tombolBukanMilikmu();
        cmdPath = '../commands/game/duelcoin.js';
        args = p.slice(1);
        cmdName = 'duelcoin';
        if (['heads', 'tails', 'duel_decline', 'duel_accept'].includes(p[1])) harusUpdate = true;
      },

      suit_: () => {
        const p = customId.split('_');
        const uid = p.pop();
        if (userId !== uid) return tombolBukanMilikmu();
        cmdPath = '../commands/game/suit.js';
        args = p.slice(1);
        cmdName = 'suit';
        if (['batu', 'kertas', 'gunting'].includes(p[1])) harusUpdate = true;
      },

      msuit_: () => {
        const p = customId.split('_');
        const uid = p.pop();
        if (userId !== uid) return tombolBukanMilikmu();
        cmdPath = '../commands/game/msuit.js';
        args = p.slice(1);
        cmdName = 'msuit';
        if (['rock', 'paper', 'scissors'].includes(p[1])) harusUpdate = true;
      },

      stalk_: () => {
        const p = customId.split('_');
        const tipe = p[1];
        const uid = p.pop();
        if (userId !== uid) return tombolBukanMilikmu();
        cmdPath = '../commands/random/stalktiktok.js';
        args = tipe === 'videos' ? [p[2], 'videos'] : [p[2]];
        cmdName = 'stalktiktok';
        harusUpdate = true;
      },

      game_role_: () => {
        const p = customId.split('_');
        const uid = p.pop();
        if (userId !== uid) return tombolBukanMilikmu();
        cmdPath = '../commands/moderation/gamerole.js';
        args = p.slice(1);
        cmdName = 'gamerole';
        harusUpdate = true;
      },

      cn_: () => {
        const p = customId.split('_');
        const uid = p.pop();
        if (!customId.includes(`_${uid}`)) return tombolBukanMilikmu();
        cmdPath = '../commands/moderation/cnresponse.js';
        args = [p[0], uid];
        cmdName = 'cnresponse';
        harusUpdate = true;
      },

      myvc_: () => {
        const p = customId.split('_');
        const uid = p.pop();
        if (userId !== uid) return tombolBukanMilikmu();
        cmdPath = '../commands/moderation/myvc.js';
        args = [p[1]];
        cmdName = 'myvc';
        if (['change', 'limit', 'lock', 'unlock', 'kick', 'hide', 'show', 'transfer', 'delete', 'refresh', 'clone'].includes(p[1])) harusUpdate = true;
      },

      listfit_: () => {
        const p = customId.split('_');
        const uid = p.pop();
        if (userId !== uid) return tombolBukanMilikmu();
        cmdPath = '../commands/info/listfit.js';
        args = [p[1]];
        cmdName = 'listfit';
        if (['support', 'server', 'prev', 'next'].includes(p[1])) harusUpdate = true;
      }
    };

    const prefix = customId.split('_')[0];
    if (penanganTombol[prefix + '_']) {
      penanganTombol[prefix + '_']();
    } else {
      for (const folder of ['game', 'admin', 'ekonomi', 'toko', 'menubot', 'moderation', 'random']) {
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
    }

    if (!cmdPath) {
      return balasAman({
        content: 'sepertinya tombol error silahkan beritahu anos!',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      delete require.cache[require.resolve(cmdPath)];
      const cmd = require(cmdPath);
      const pesanPalsu = {
        author: user,
        channel: interaction.channel,
        guild: interaction.guild,
        member: interaction.member,
        content: `!main ${cmdName} ${args.join(' ')}`.trim(),
        reply: harusUpdate ? interaction.update.bind(interaction) : balasAman
      };
      if (cmd.execute) cmd.execute(pesanPalsu, args, client);
    } catch (e) {
      console.error(e);
      if (!interaction.replied && !interaction.deferred) {
        balasAman({ content: 'Terjadi error!', flags: MessageFlags.Ephemeral });
      }
    }
  }
};
