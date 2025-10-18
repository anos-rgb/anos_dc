const { Events } = require('discord.js');
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
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (user.bot) return;

        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Error fetching reaction:', error);
                return;
            }
        }

        const guildData = getGuildData(reaction.message.guild.id);
        if (!guildData || !guildData.reactRoles) return;

        const reactRoleData = guildData.reactRoles[reaction.message.id];
        if (!reactRoleData) return;

        if (reaction.emoji.name !== reactRoleData.emoji) return;

        try {
            const member = await reaction.message.guild.members.fetch(user.id);
            const role = await reaction.message.guild.roles.fetch(reactRoleData.roleId);

            if (!role) {
                console.error('Role tidak ditemukan!');
                return;
            }

            await member.roles.add(role);
            console.log(`✅ Role ${role.name} diberikan ke ${user.tag}`);
            
            try {
                await user.send(`✅ Kamu telah mendapatkan role **${role.name}** di server **${reaction.message.guild.name}**!`);
            } catch (error) {
                console.log(`Tidak bisa mengirim DM ke ${user.tag}`);
            }

        } catch (error) {
            console.error('Error adding role:', error);
        }
    },
};