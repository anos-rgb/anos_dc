const fs = require('fs');
const path = require('path');

function getGuildData(guildId) {
    const filePath = path.join(__dirname, '..', 'data', `${guildId}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
}

module.exports = {
    name: 'messageReactionAdd',
    execute(reaction, user) {
        if (user.bot) return;

        const guildData = getGuildData(reaction.message.guild.id);
        if (!guildData || !guildData.reactRoles) return;
        
        const messageData = guildData.reactRoles[reaction.message.id];
        if (!messageData) return;
        
        if (reaction.emoji.name === messageData.emoji) {
            const guild = reaction.message.guild;
            const member = guild.members.cache.get(user.id);
            const role = guild.roles.cache.get(messageData.roleId);
            
            if (member && role && !member.roles.cache.has(role.id)) {
                member.roles.add(role).catch(console.error);
            }
        }
    },
};