const path = require('path');
const fs = require('fs');

function loadInviteRoleData(guildId) {
    const dataPath = path.join(__dirname, '..', 'data', `inviteRoles_${guildId}.json`);
    
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
    name: 'guildMemberAdd',
    async execute(member, client) {
        const guildData = client.loadGuildData(member.guild.id);
        
        // Auto role system yang sudah ada
        if (guildData.autoRoles && guildData.autoRoles.length > 0) {
            for (const autoRole of guildData.autoRoles) {
                const role = member.guild.roles.cache.get(autoRole.roleId);
                
                if (role) {
                    setTimeout(async () => {
                        try {
                            const currentMember = await member.guild.members.fetch(member.id).catch(() => null);
                            if (currentMember && !currentMember.roles.cache.has(role.id)) {
                                await currentMember.roles.add(role);
                                console.log(`Auto role ${role.name} diberikan kepada ${member.user.tag}`);
                            }
                        } catch (error) {
                            console.error(`Error memberikan auto role kepada ${member.user.tag}:`, error);
                        }
                    }, autoRole.delayMs);
                }
            }
        }

        // Invite tracking dan auto role berdasarkan invite
        let inviteInfo = '';
        let usedInviteCode = null;
        
        try {
            const invites = await member.guild.invites.fetch();
            const cachedInvites = client.invites.get(member.guild.id) || new Map();
            
            const usedInvite = invites.find(invite => 
                cachedInvites.has(invite.code) && 
                invite.uses > cachedInvites.get(invite.code)
            );
            
            if (usedInvite) {
                inviteInfo = `\n**Diundang oleh:** ${usedInvite.inviter.username}`;
                usedInviteCode = usedInvite.code;
                cachedInvites.set(usedInvite.code, usedInvite.uses);
            } else {
                inviteInfo = `\n**Diundang oleh:** Tidak diketahui`;
            }
            
            invites.forEach(invite => {
                cachedInvites.set(invite.code, invite.uses);
            });
            client.invites.set(member.guild.id, cachedInvites);
            
        } catch (error) {
            console.error('Error fetching invites:', error);
        }

        // Auto role berdasarkan invite link tertentu
        if (usedInviteCode) {
            const inviteRoleData = loadInviteRoleData(member.guild.id);
            
            if (inviteRoleData[usedInviteCode]) {
                const roleData = inviteRoleData[usedInviteCode];
                const role = member.guild.roles.cache.get(roleData.roleId);
                
                if (role && !member.roles.cache.has(role.id)) {
                    try {
                        await member.roles.add(role, `Auto role dari invite: ${usedInviteCode}`);
                        console.log(`Auto role ${role.name} diberikan kepada ${member.user.tag} dari invite ${usedInviteCode}`);
                        
                        // Log ke channel log jika ada
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
                                        value: `${usedInviteCode}`,
                                        inline: true
                                    }
                                ],
                                timestamp: new Date()
                            };
                            
                            logChannel.send({ embeds: [embed] }).catch(() => {});
                        }
                        
                    } catch (error) {
                        console.error(`Failed to give auto role to ${member.user.tag}:`, error);
                    }
                }
            }
        }
        
        // Welcome message system yang sudah ada
        let channel;
        let isWelcome2 = false;
        
        if (guildData.welcomeChannel) {
            channel = member.guild.channels.cache.get(guildData.welcomeChannel);
        } else if (guildData.welcomech) {
            channel = member.guild.channels.cache.get(guildData.welcomech);
            isWelcome2 = true;
        }
        
        if (!channel) return;

        const memberCount = member.guild.memberCount;
        const joinTime = new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        if (isWelcome2) {
            let message = guildData.welcomeMessage || `Selamat datang ${member} di **${member.guild.name}**!`;
            message = message.replace(/{nickname}/g, member.displayName);
            message = message.replace(/{username}/g, member.user.username);
            message = message.replace(/{server}/g, member.guild.name);
            message = message.replace(/{membercount}/g, memberCount);
            message = message.replace(/{@}/g, member.toString());
            
            channel.send(message).catch(console.error);
        } else {
            const embed = {
                title: '🎉 Selamat Datang!',
                description: `Halo ${member.user.username}, selamat datang di **${member.guild.name}**!\n\nKamu adalah member ke-**${memberCount}**${inviteInfo}\n\n**Waktu Bergabung:** ${joinTime}`,
                color: 0x00ff00,
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true })
                },
                image: {
                    url: 'attachment://Welcome.gif'
                },
                footer: {
                    text: `User ID: ${member.user.id}`,
                    icon_url: member.guild.iconURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            const gifPath = path.join(__dirname, '..', 'media', 'Welcome.gif');
            
            channel.send({
                embeds: [embed],
                files: [{
                    attachment: gifPath,
                    name: 'Welcome.gif'
                }]
            }).catch(error => {
                console.error('Error sending welcome message:', error);
                channel.send({ embeds: [embed] }).catch(console.error);
            });
        }
    }
};