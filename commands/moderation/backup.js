const { PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'backup',
    description: 'Backup pengaturan server',
    usage: '!backup <buat|channel|role>',
    permissions: [PermissionFlagsBits.Administrator],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Anda tidak memiliki permission untuk menggunakan command ini!');
        }

        if (args.length < 1) {
            return message.reply('Usage: `!backup <buat|channel|role>`');
        }

        const subcommand = args[0].toLowerCase();
        
        if (!['buat', 'channel', 'role'].includes(subcommand)) {
            return message.reply('❌ Subcommand tidak valid! Gunakan: `buat`, `channel`, atau `role`');
        }

        const processingMsg = await message.reply('⏳ Memproses backup...');
        const guild = message.guild;

        if (subcommand === 'buat') {
            try {
                const backupData = {
                    serverInfo: {
                        name: guild.name,
                        description: guild.description,
                        memberCount: guild.memberCount,
                        createdAt: guild.createdAt,
                        ownerId: guild.ownerId
                    },
                    channels: [],
                    roles: [],
                    backupTime: new Date()
                };

                guild.channels.cache.forEach(channel => {
                    backupData.channels.push({
                        name: channel.name,
                        type: channel.type,
                        position: channel.position,
                        parentId: channel.parentId
                    });
                });

                guild.roles.cache.forEach(role => {
                    if (role.name !== '@everyone') {
                        backupData.roles.push({
                            name: role.name,
                            color: role.color,
                            permissions: role.permissions.toArray(),
                            position: role.position,
                            mentionable: role.mentionable,
                            hoist: role.hoist
                        });
                    }
                });

                const fileName = `backup_${guild.name}_${Date.now()}.json`;
                const backupJson = JSON.stringify(backupData, null, 2);
                
                fs.writeFileSync(fileName, backupJson);
                
                const attachment = new AttachmentBuilder(fileName);
                
                await processingMsg.edit({ 
                    content: '✅ Backup server berhasil dibuat!',
                    files: [attachment]
                });

                fs.unlinkSync(fileName);

            } catch (error) {
                await processingMsg.edit({ content: '❌ Gagal membuat backup!' });
            }
        }

        if (subcommand === 'channel') {
            try {
                const channelData = {
                    serverName: guild.name,
                    channels: [],
                    backupTime: new Date()
                };

                guild.channels.cache.forEach(channel => {
                    channelData.channels.push({
                        name: channel.name,
                        type: channel.type === 0 ? 'Text' : channel.type === 2 ? 'Voice' : 'Category',
                        position: channel.position,
                        parent: channel.parent?.name || 'Tidak ada kategori'
                    });
                });

                const fileName = `channels_${guild.name}_${Date.now()}.json`;
                const channelJson = JSON.stringify(channelData, null, 2);
                
                fs.writeFileSync(fileName, channelJson);
                
                const attachment = new AttachmentBuilder(fileName);
                
                await processingMsg.edit({ 
                    content: '✅ Backup channel berhasil dibuat!',
                    files: [attachment]
                });

                fs.unlinkSync(fileName);

            } catch (error) {
                await processingMsg.edit({ content: '❌ Gagal membuat backup channel!' });
            }
        }

        if (subcommand === 'role') {
            try {
                const roleData = {
                    serverName: guild.name,
                    roles: [],
                    backupTime: new Date()
                };

                guild.roles.cache.forEach(role => {
                    if (role.name !== '@everyone') {
                        roleData.roles.push({
                            name: role.name,
                            color: role.hexColor,
                            memberCount: role.members.size,
                            permissions: role.permissions.toArray(),
                            position: role.position,
                            mentionable: role.mentionable,
                            hoisted: role.hoist
                        });
                    }
                });

                const fileName = `roles_${guild.name}_${Date.now()}.json`;
                const roleJson = JSON.stringify(roleData, null, 2);
                
                fs.writeFileSync(fileName, roleJson);
                
                const attachment = new AttachmentBuilder(fileName);
                
                await processingMsg.edit({ 
                    content: '✅ Backup role berhasil dibuat!',
                    files: [attachment]
                });

                fs.unlinkSync(fileName);

            } catch (error) {
                await processingMsg.edit({ content: '❌ Gagal membuat backup role!' });
            }
        }
    },
};