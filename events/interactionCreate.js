const fs = require('fs');
const path = require('path');
const { MessageFlags } = require('discord.js');

const COMMAND_DIRECTORIES = ['game', 'admin', 'ekonomi', 'toko', 'menubot', 'moderation', 'random'];
const USER_ID_PATTERN = /^\d{17,19}$/;

class InteractionHandler {
  constructor() {
    this.commandMap = new Map();
    this.initializeCommandMap();
  }

  initializeCommandMap() {
    const handlers = {
      megaslot_: this.handleMegaslot,
      duelcoin_: this.handleDuelcoin,
      game_role_: this.handleGameRole,
      resetuser_: this.handleResetUser,
      stalk_: this.handleStalk,
      suit_: this.handleSuit,
      tebaktombol_: this.handleTebakTombol,
      voice_settings: this.handleVoiceSettings,
      myvc_: this.handleMyVc,
      gamerole_select: this.handleGameRoleSelect,
      random_role_select: this.handleRandomRoleSelect
    };

    for (const [prefix, handler] of Object.entries(handlers)) {
      this.commandMap.set(prefix, handler.bind(this));
    }
  }

  async safeReply(interaction, options) {
    try {
      if (interaction.replied || interaction.deferred) {
        return await interaction.followUp(options);
      }
      return await interaction.reply(options);
    } catch (error) {
      console.error('Failed to reply to interaction:', error);
    }
  }

  unauthorizedAccess(interaction) {
    return this.safeReply(interaction, {
      content: 'Ini bukan tombol/menu untukmu!',
      flags: MessageFlags.Ephemeral
    });
  }

  validateUserAccess(interaction, targetUserId) {
    return interaction.user.id === targetUserId || targetUserId === 'any';
  }

  parseCustomId(customId) {
    return customId.split('_');
  }

  handleMegaslot(interaction) {
    const [, bet, uid] = this.parseCustomId(interaction.customId);
    if (!this.validateUserAccess(interaction, uid)) return this.unauthorizedAccess(interaction);
    
    return {
      cmdPath: '../commands/game/megaslot',
      args: [bet],
      cmdName: 'megaslot',
      update: true
    };
  }

  handleDuelcoin(interaction) {
    const parts = this.parseCustomId(interaction.customId);
    const uid = parts.pop();
    if (!this.validateUserAccess(interaction, uid)) return this.unauthorizedAccess(interaction);
    
    return {
      cmdPath: '../commands/game/duelcoin',
      args: parts.slice(1),
      cmdName: 'duelcoin',
      update: true
    };
  }

  handleGameRole(interaction) {
    const [,, uid] = this.parseCustomId(interaction.customId);
    if (!this.validateUserAccess(interaction, uid)) return this.unauthorizedAccess(interaction);
    
    return {
      cmdPath: '../commands/moderation/randomrole',
      cmdName: 'randomrole',
      args: interaction.values
    };
  }

  handleResetUser(interaction) {
    const [, uid] = this.parseCustomId(interaction.customId);
    if (!this.validateUserAccess(interaction, uid)) return this.unauthorizedAccess(interaction);
    
    return {
      cmdPath: '../commands/admin/resetuser',
      cmdName: 'resetuser',
      args: [uid]
    };
  }

  handleStalk(interaction) {
    const [, type, username, uid] = this.parseCustomId(interaction.customId);
    if (!this.validateUserAccess(interaction, uid)) return this.unauthorizedAccess(interaction);
    
    return {
      cmdPath: '../commands/random/stalktt',
      cmdName: 'stalktiktok',
      args: [username, type],
      update: true
    };
  }

  handleSuit(interaction) {
    const [,, uid] = this.parseCustomId(interaction.customId);
    if (!this.validateUserAccess(interaction, uid)) return this.unauthorizedAccess(interaction);
    
    return {
      cmdPath: '../commands/game/suit',
      cmdName: 'suit',
      args: interaction.values || [this.parseCustomId(interaction.customId)[1]],
      update: true
    };
  }

  handleTebakTombol(interaction) {
    const [, uid] = this.parseCustomId(interaction.customId);
    if (!this.validateUserAccess(interaction, uid)) return this.unauthorizedAccess(interaction);
    
    return {
      cmdPath: '../commands/game/tebaktombol',
      cmdName: 'tebaktombol',
      args: [interaction.values?.[0] || this.parseCustomId(interaction.customId)[1]]
    };
  }

  handleVoiceSettings(interaction) {
    const [, action, uid] = this.parseCustomId(interaction.customId);
    if (!this.validateUserAccess(interaction, uid)) return this.unauthorizedAccess(interaction);
    
    return {
      cmdPath: '../commands/moderation/myvc',
      cmdName: 'myvc',
      args: [action]
    };
  }

  handleMyVc(interaction) {
    const [, action, uid] = this.parseCustomId(interaction.customId);
    if (!this.validateUserAccess(interaction, uid)) return this.unauthorizedAccess(interaction);
    
    return {
      cmdPath: '../commands/moderation/myvc',
      cmdName: 'myvc',
      args: [action]
    };
  }

  handleGameRoleSelect(interaction) {
    return {
      cmdPath: '../commands/moderation/gamerole',
      cmdName: 'gamerole',
      args: interaction.values
    };
  }

  handleRandomRoleSelect(interaction) {
    return {
      cmdPath: '../commands/moderation/randomrole',
      cmdName: 'randomrole',
      args: interaction.values
    };
  }

  findCommandFile(prefix) {
    for (const dir of COMMAND_DIRECTORIES) {
      const filePath = path.resolve(__dirname, `../commands/${dir}/${prefix}.js`);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
    return null;
  }

  parseGenericCustomId(interaction, cmdPath) {
    const parts = this.parseCustomId(interaction.customId);
    const lastPart = parts.at(-1);
    
    if (USER_ID_PATTERN.test(lastPart)) {
      if (!this.validateUserAccess(interaction, lastPart)) {
        return { unauthorized: true };
      }
      return {
        cmdPath,
        cmdName: parts[0],
        args: parts.slice(1, -1)
      };
    }
    
    return {
      cmdPath,
      cmdName: parts[0],
      args: parts.slice(1)
    };
  }

  async executeCommand(interaction, commandInfo, client) {
    const { cmdPath, cmdName, args, update } = commandInfo;
    
    try {
      delete require.cache[require.resolve(cmdPath)];
      const command = require(cmdPath);
      
      const mockMessage = {
        author: interaction.user,
        channel: interaction.channel,
        guild: interaction.guild,
        member: interaction.member,
        content: `!${cmdName} ${args.join(' ')}`.trim(),
        reply: update ? interaction.update.bind(interaction) : this.safeReply.bind(this, interaction)
      };
      
      if (command.execute) {
        await command.execute(mockMessage, args, client);
      }
      
      if (interaction.isButton() && command.handleButtonInteraction) {
        await command.handleButtonInteraction(interaction, client);
      }
    } catch (error) {
      console.error('Command execution error:', error);
      await this.safeReply(interaction, {
        content: 'Terjadi error saat menjalankan perintah!',
        flags: MessageFlags.Ephemeral
      });
    }
  }

  async handleInteraction(interaction, client) {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    const prefix = this.parseCustomId(interaction.customId)[0];
    const prefixKey = prefix + '_';
    
    let commandInfo = null;

    if (this.commandMap.has(prefixKey)) {
      const result = this.commandMap.get(prefixKey)(interaction);
      if (result?.unauthorized) return;
      commandInfo = result;
    } else {
      const cmdPath = this.findCommandFile(prefix);
      if (cmdPath) {
        const result = this.parseGenericCustomId(interaction, cmdPath);
        if (result.unauthorized) return this.unauthorizedAccess(interaction);
        commandInfo = result;
      }
    }

    if (!commandInfo) {
      return this.unauthorizedAccess(interaction);
    }

    await this.executeCommand(interaction, commandInfo, client);
  }
}

const interactionHandler = new InteractionHandler();

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    await interactionHandler.handleInteraction(interaction, client);
  }
};