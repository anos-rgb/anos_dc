const fs = require('fs');
const path = require('path');
const { MessageFlags } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    const balasAman = async (opts) => {
      try {
        if (interaction.replied || interaction.deferred) return interaction.followUp(opts);
        return interaction.reply(opts);
      } catch {
      }
    };

    const bukanUntukmu = () =>
      balasAman({ content: 'Ini bukan tombol/menu untukmu!', flags: MessageFlags.Ephemeral });

    const userId = interaction.user.id;
    let cmdPath = null;
    let cmdName = '';
    let args = [];
    let update = false;

    const prefix = interaction.customId.split('_')[0];

    if (interaction.isButton() || interaction.isStringSelectMenu()) {
      const map = {
        megaslot_: () => { const [, bet, uid] = interaction.customId.split('_'); if (userId !== uid) return bukanUntukmu(); cmdPath = '../commands/game/megaslot'; args = [bet]; cmdName = 'megaslot'; update = true; },
        duelcoin_: () => { const p = interaction.customId.split('_'); const uid = p.pop(); if (userId !== uid) return bukanUntukmu(); cmdPath = '../commands/game/duelcoin'; args = p.slice(1); cmdName = 'duelcoin'; update = true; },
        game_role_: () => { const [,, uid] = interaction.customId.split('_'); if (userId !== uid && uid !== 'any') return bukanUntukmu(); cmdPath = '../commands/moderation/randomrole'; cmdName = 'randomrole'; args = interaction.values; },
        resetuser_: () => { const [, uid] = interaction.customId.split('_'); if (userId !== uid) return bukanUntukmu(); cmdPath = '../commands/admin/resetuser'; cmdName = 'resetuser'; args = [uid]; },
        stalk_: () => { const [, type, username, uid] = interaction.customId.split('_'); if (userId !== uid) return bukanUntukmu(); cmdPath = '../commands/random/stalktt'; cmdName = 'stalktiktok'; args = [username, type]; update = true; },
        suit_: () => { const [,, uid] = interaction.customId.split('_'); if (userId !== uid) return bukanUntukmu(); cmdPath = '../commands/game/suit'; cmdName = 'suit'; args = interaction.values || [interaction.customId.split('_')[1]]; update = true; },
        tebaktombol_: () => { const [, uid] = interaction.customId.split('_'); if (userId !== uid) return bukanUntukmu(); cmdPath = '../commands/game/tebaktombol'; cmdName = 'tebaktombol'; args = [interaction.values?.[0] || interaction.customId.split('_')[1]]; },
        voice_settings: () => { const [, action, uid] = interaction.customId.split('_'); if (userId !== uid) return bukanUntukmu(); cmdPath = '../commands/moderation/myvc'; cmdName = 'myvc'; args = [action]; },
        myvc_: () => { const [, action, uid] = interaction.customId.split('_'); if (userId !== uid) return bukanUntukmu(); cmdPath = '../commands/moderation/myvc'; cmdName = 'myvc'; args = [action]; },
        gamerole_select: () => { cmdPath = '../commands/modderation/gamerole'; cmdName = 'gamerole'; args = interaction.values; },
        random_role_select: () => { cmdPath = '../commands/moderation/randomrole'; cmdName = 'randomrole'; args = interaction.values; }
      };

      if (map[prefix + '_']) {
        const ret = map[prefix + '_']();
        if (ret) return;
      } else {
        for (const dir of ['game', 'admin', 'ekonomi', 'toko', 'menubot', 'moderation', 'random']) {
          const file = path.resolve(__dirname, `../commands/${dir}/${prefix}.js`);
          if (fs.existsSync(file)) {
            cmdPath = file;
            cmdName = prefix;
            const parts = interaction.customId.split('_');
            const last = parts.at(-1);
            if (/^\d{17,19}$/.test(last)) {
              if (userId !== last) return bukanUntukmu();
              args = parts.slice(1, -1);
            } else {
              args = parts.slice(1);
            }
            break;
          }
        }
      }

      if (!cmdPath) return bukanUntukmu();

      try {
        delete require.cache[require.resolve(cmdPath)];
        const cmd = require(cmdPath);
        const fakeMsg = {
          author: interaction.user,
          channel: interaction.channel,
          guild: interaction.guild,
          member: interaction.member,
          content: `!${cmdName} ${args.join(' ')}`.trim(),
          reply: update ? interaction.update.bind(interaction) : balasAman
        };
        if (cmd.execute) cmd.execute(fakeMsg, args, client);
        if (interaction.isButton() && cmd.handleButtonInteraction) cmd.handleButtonInteraction(interaction, client);
      } catch (err) {
        console.error(err);
        balasAman({ content: 'Terjadi error!', flags: MessageFlags.Ephemeral });
      }
    }
  }
};