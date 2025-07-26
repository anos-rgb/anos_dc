const fs = require('fs');
const path = require('path');

const inviteRoleData = new Map();

function saveInviteData(guildId, data) {
  const dataPath = path.join(__dirname, '..', 'data', `inviteRoles_${guildId}.json`);
  const dir = path.dirname(dataPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function loadInviteData(guildId) {
  const dataPath = path.join(__dirname, '..', '..', 'data', `inviteRoles_${guildId}.json`);
  
  if (fs.existsSync(dataPath)) {
    try {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
      return {};
    }
  }
  return {};
}

module.exports = {
  name: 'giverole',
  description: 'Set auto role untuk invite link tertentu',
  aliases: ['autorole', 'setrole'],
  cooldown: 1,
  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
    }

    if (args.length < 2) {
      return message.reply('❌ Penggunaan: `!giverole <invite_link> <@role>`\nContoh: `!giverole https://discord.gg/y8jYv2ZgJ7 @Member`');
    }

    const inviteArg = args[0];
    const roleArg = args[1];

    let inviteCode;
    if (inviteArg.includes('discord.gg/')) {
      inviteCode = inviteArg.split('discord.gg/')[1];
    } else if (inviteArg.includes('discord.com/invite/')) {
      inviteCode = inviteArg.split('discord.com/invite/')[1];
    } else {
      inviteCode = inviteArg;
    }

    if (!inviteCode) {
      return message.reply('❌ Format invite link tidak valid!');
    }

    let targetRole;
    if (roleArg.startsWith('<@&') && roleArg.endsWith('>')) {
      const roleId = roleArg.slice(3, -1);
      targetRole = message.guild.roles.cache.get(roleId);
    } else {
      targetRole = message.guild.roles.cache.find(role => 
        role.name.toLowerCase() === roleArg.toLowerCase()
      );
    }

    if (!targetRole) {
      return message.reply('❌ Role tidak ditemukan! Pastikan Anda mention role dengan benar.');
    }

    if (targetRole.position >= message.member.roles.highest.position) {
      return message.reply('❌ Anda tidak dapat mengatur role yang lebih tinggi atau sama dengan role Anda!');
    }

    if (targetRole.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ Bot tidak dapat memberikan role yang lebih tinggi dari role bot!');
    }

    try {
      const invite = await message.guild.invites.fetch(inviteCode);
      if (!invite) {
        return message.reply('❌ Invite link tidak valid atau tidak ditemukan di server ini!');
      }

      const guildId = message.guild.id;
      let guildInviteData = loadInviteData(guildId);
      
      guildInviteData[inviteCode] = {
        roleId: targetRole.id,
        roleName: targetRole.name,
        createdBy: message.author.id,
        createdAt: Date.now()
      };

      saveInviteData(guildId, guildInviteData);
      inviteRoleData.set(guildId, guildInviteData);

      const embed = {
        color: 0x00ff00,
        title: '✅ Auto Role Berhasil Diatur',
        fields: [
          {
            name: 'Invite Link',
            value: `https://discord.gg/${inviteCode}`,
            inline: true
          },
          {
            name: 'Role',
            value: `${targetRole}`,
            inline: true
          },
          {
            name: 'Dibuat oleh',
            value: `${message.author}`,
            inline: true
          }
        ],
        footer: {
          text: 'Semua member yang join menggunakan invite ini akan otomatis mendapat role tersebut'
        },
        timestamp: new Date()
      };

      return message.reply({ embeds: [embed] });

    } catch (error) {
      return message.reply('❌ Terjadi error saat memproses invite link. Pastikan invite link valid dan bot memiliki permission yang cukup!');
    }
  }
};

module.exports.handleMemberJoin = async (member) => {
  const guildId = member.guild.id;
  let guildInviteData = inviteRoleData.get(guildId);
  
  if (!guildInviteData) {
    guildInviteData = loadInviteData(guildId);
    inviteRoleData.set(guildId, guildInviteData);
  }

  if (Object.keys(guildInviteData).length === 0) return;

  try {
    const invites = await member.guild.invites.fetch();
    
    for (const [inviteCode, inviteData] of Object.entries(guildInviteData)) {
      const invite = invites.get(inviteCode);
      
      if (invite && invite.uses > 0) {
        const role = member.guild.roles.cache.get(inviteData.roleId);
        
        if (role && !member.roles.cache.has(role.id)) {
          try {
            await member.roles.add(role, `Auto role dari invite: ${inviteCode}`);
            
            const logChannel = member.guild.channels.cache.find(ch => 
              ch.name.includes('log') || ch.name.includes('audit')
            );
            
            if (logChannel) {
              const embed = {
                color: 0x00ff00,
                title: '🎭 Auto Role Diberikan',
                fields: [
                  {
                    name: 'Member',
                    value: `${member.user.tag} (${member.id})`,
                    inline: true
                  },
                  {
                    name: 'Role',
                    value: `${role.name}`,
                    inline: true
                  },
                  {
                    name: 'Invite Code',
                    value: `${inviteCode}`,
                    inline: true
                  }
                ],
                timestamp: new Date()
              };
              
              logChannel.send({ embeds: [embed] }).catch(() => {});
            }
            
            break;
          } catch (error) {
            console.error(`Failed to give auto role to ${member.user.tag}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in handleMemberJoin:', error);
  }
};

module.exports.initializeGuild = async (guild) => {
  const guildId = guild.id;
  const guildInviteData = loadInviteData(guildId);
  inviteRoleData.set(guildId, guildInviteData);
};