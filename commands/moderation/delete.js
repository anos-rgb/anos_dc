const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'delete',
    description: 'Hapus kategori dan semua channel di dalamnya',
    usage: '!delete <category_name>',
    
    async execute(message, args) {
        if (!args.length) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('Please provide a category name.\nUsage: `!delete <category_name>`')
                .setColor('#ff0000')
                .setFooter({ text: 'anos6501' });
            
            return await message.reply({ embeds: [errorEmbed] });
        }

        if (!this.isAdminOrOwner(message)) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('You don\'t have permission to use this command.')
                .setColor('#ff0000')
                .setFooter({ text: 'anos6501' });
            
            return await message.reply({ embeds: [errorEmbed] });
        }

        const categoryName = args.join(' ');
        const categoryObj = message.guild.channels.cache.find(
            channel => channel.type === ChannelType.GuildCategory && channel.name.toLowerCase() === categoryName.toLowerCase()
        );

        if (!categoryObj) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`Category \`${categoryName}\` not found.`)
                .setColor('#ff0000')
                .setFooter({ text: 'anos6501' });
            
            return await message.reply({ embeds: [errorEmbed] });
        }

        const confirmEmbed = new EmbedBuilder()
            .setTitle('Confirmation')
            .setDescription(`You really want to delete \`${categoryObj.name}\` with all channels?\nType "confirm" to delete.`)
            .setColor('#ffff00')
            .setFooter({ text: 'anos6501' });

        const confirmMessage = await message.reply({ embeds: [confirmEmbed] });

        const filter = m => m.author.id === message.author.id && 
                            m.content.toLowerCase() === 'confirm' && 
                            m.channel.id === message.channel.id;

        try {
            await message.channel.awaitMessages({ 
                filter, 
                max: 1, 
                time: 30000, 
                errors: ['time'] 
            });
        } catch (error) {
            const cancelEmbed = new EmbedBuilder()
                .setTitle('Cancelled')
                .setDescription('Delete operation timed out.')
                .setColor('#ff0000')
                .setFooter({ text: 'anos6501' });
            
            return await confirmMessage.edit({ embeds: [cancelEmbed] });
        }

        const loadingFrames = [
            "█▒▒▒▒▒▒▒▒▒", "██▒▒▒▒▒▒▒▒", "███▒▒▒▒▒▒▒", "████▒▒▒▒▒▒",
            "█████▒▒▒▒▒", "██████▒▒▒▒", "███████▒▒▒", "████████▒▒",
            "█████████▒", "██████████"
        ];

        for (let i = 0; i < loadingFrames.length; i++) {
            const loadingEmbed = new EmbedBuilder()
                .setTitle('Processing')
                .setDescription(`Deleting \`${categoryObj.name}\`\n${loadingFrames[i]}`)
                .setColor('#0099ff')
                .setFooter({ text: 'anos6501' });
            
            await confirmMessage.edit({ embeds: [loadingEmbed] });
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        let channelsDeleted = 0;
        const channelsToDelete = Array.from(categoryObj.children.cache.values());

        for (const channel of channelsToDelete) {
            try {
                await channel.delete();
                channelsDeleted++;
            } catch (error) {
                console.error(`Error deleting channel ${channel.name}:`, error);
            }
        }

        try {
            await categoryObj.delete();
            
            const successEmbed = new EmbedBuilder()
                .setTitle('Success')
                .setDescription(`Success delete \`${categoryObj.name}\`\nDeleted ${channelsDeleted} channel(s).`)
                .setColor('#00ff00')
                .setFooter({ text: 'anos6501' });
            
            await confirmMessage.edit({ embeds: [successEmbed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`Error deleting category: ${error.message}`)
                .setColor('#ff0000')
                .setFooter({ text: 'anos6501' });
            
            await confirmMessage.edit({ embeds: [errorEmbed] });
        }
    },

    isAdminOrOwner(message) {
        if (message.member.permissions.has(PermissionFlagsBits.Administrator) || 
            message.author.id === message.guild.ownerId) {
            return true;
        }
        
        return message.member.roles.cache.some(role => 
            role.permissions.has(PermissionFlagsBits.ManageChannels) || 
            role.permissions.has(PermissionFlagsBits.Administrator)
        );
    }
};