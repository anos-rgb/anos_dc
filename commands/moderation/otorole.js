const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'otorole',
    description: 'Mengatur role otomatis untuk member baru',
    
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            const noPermEmbed = new EmbedBuilder()
                .setTitle('❌ Akses Ditolak')
                .setDescription('Kamu tidak memiliki izin untuk menggunakan command ini!')
                .setColor('#ff0000')
                .setTimestamp();
            
            return await message.reply({ embeds: [noPermEmbed] });
        }

        const guildData = client.loadGuildData(message.guild.id);

        if (!guildData.autoRoles) {
            guildData.autoRoles = [];
        }

        if (args.length === 0) {
            const currentRoles = guildData.autoRoles.map((autoRole, index) => {
                const role = message.guild.roles.cache.get(autoRole.roleId);
                const roleName = role ? role.name : 'Role tidak ditemukan';
                return `${index + 1}. ${roleName} - ${autoRole.delay}`;
            }).join('\n') || 'Tidak ada auto role yang diatur';

            const listEmbed = new EmbedBuilder()
                .setTitle('📋 Daftar Auto Role')
                .setDescription(`**Auto Role Saat Ini:**\n${currentRoles}\n\n**Cara Penggunaan:**\n\`!otorole @role [waktu]\`\n\n**Format Waktu:**\n- d/detik (contoh: 30d)\n- m/menit (contoh: 5m)\n- j/jam (contoh: 2j)\n- h/hari (contoh: 1h)\n\n**Perintah Lain:**\n- \`!otorole remove [nomor]\` - Hapus auto role\n- \`!otorole clear\` - Hapus semua auto role`)
                .setColor('#00ff88')
                .setFooter({ text: 'by anos?!' })
                .setTimestamp();

            return await message.reply({ embeds: [listEmbed] });
        }

        if (args[0].toLowerCase() === 'remove') {
            if (!args[1] || isNaN(args[1])) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Format Salah')
                    .setDescription('Gunakan: `!otorole remove [nomor]`')
                    .setColor('#ff0000')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            const index = parseInt(args[1]) - 1;
            if (index < 0 || index >= guildData.autoRoles.length) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Nomor Tidak Valid')
                    .setDescription('Nomor auto role tidak ditemukan!')
                    .setColor('#ff0000')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            const removedRole = guildData.autoRoles.splice(index, 1)[0];
            const role = message.guild.roles.cache.get(removedRole.roleId);
            const roleName = role ? role.name : 'Role tidak ditemukan';

            try {
                client.saveGuildData(message.guild.id, guildData);
                
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Auto Role Dihapus')
                    .setDescription(`Auto role **${roleName}** berhasil dihapus!`)
                    .setColor('#00ff88')
                    .setFooter({ text: 'by anos?!' })
                    .setTimestamp();

                return await message.reply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error menyimpan data:', error);
                
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Error')
                    .setDescription('Terjadi kesalahan saat menyimpan data!')
                    .setColor('#ff0000')
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }
        }

        if (args[0].toLowerCase() === 'clear') {
            guildData.autoRoles = [];
            
            try {
                client.saveGuildData(message.guild.id, guildData);
                
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Auto Role Dibersihkan')
                    .setDescription('Semua auto role berhasil dihapus!')
                    .setColor('#00ff88')
                    .setFooter({ text: 'by anos?!' })
                    .setTimestamp();

                return await message.reply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error menyimpan data:', error);
                
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Error')
                    .setDescription('Terjadi kesalahan saat menyimpan data!')
                    .setColor('#ff0000')
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }
        }

        if (args.length < 2) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Format Salah')
                .setDescription('Gunakan: `!otorole @role [waktu]`\n\nContoh: `!otorole @Member 30d`')
                .setColor('#ff0000')
                .setTimestamp();
            
            return await message.reply({ embeds: [errorEmbed] });
        }

        const roleId = args[0].replace(/[<@&>]/g, '');
        const role = message.guild.roles.cache.get(roleId);
        
        if (!role) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Role Tidak Ditemukan')
                .setDescription('Role yang kamu mention tidak ditemukan!')
                .setColor('#ff0000')
                .setTimestamp();
            
            return await message.reply({ embeds: [errorEmbed] });
        }

        if (role.position >= message.member.roles.highest.position) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Role Terlalu Tinggi')
                .setDescription('Kamu tidak bisa mengatur auto role untuk role yang lebih tinggi dari role tertinggi kamu!')
                .setColor('#ff0000')
                .setTimestamp();
            
            return await message.reply({ embeds: [errorEmbed] });
        }

        const timeArg = args[1].toLowerCase();
        const timeRegex = /^(\d+)([dmjh])$/;
        const match = timeArg.match(timeRegex);

        if (!match) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Format Waktu Salah')
                .setDescription('Format waktu yang valid:\n- d/detik (contoh: 30d)\n- m/menit (contoh: 5m)\n- j/jam (contoh: 2j)\n- h/hari (contoh: 1h)')
                .setColor('#ff0000')
                .setTimestamp();
            
            return await message.reply({ embeds: [errorEmbed] });
        }

        const value = parseInt(match[1]);
        const unit = match[2];
        let delayMs;
        let delayText;

        switch (unit) {
            case 'd':
                delayMs = value * 1000;
                delayText = `${value} detik`;
                break;
            case 'm':
                delayMs = value * 60 * 1000;
                delayText = `${value} menit`;
                break;
            case 'j':
                delayMs = value * 60 * 60 * 1000;
                delayText = `${value} jam`;
                break;
            case 'h':
                delayMs = value * 24 * 60 * 60 * 1000;
                delayText = `${value} hari`;
                break;
        }

        const existingIndex = guildData.autoRoles.findIndex(autoRole => autoRole.roleId === roleId);
        
        if (existingIndex !== -1) {
            guildData.autoRoles[existingIndex] = {
                roleId: roleId,
                delay: delayText,
                delayMs: delayMs
            };
        } else {
            guildData.autoRoles.push({
                roleId: roleId,
                delay: delayText,
                delayMs: delayMs
            });
        }

        try {
            client.saveGuildData(message.guild.id, guildData);
            
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Auto Role Diatur')
                .setDescription(`Auto role **${role.name}** berhasil diatur!\n\n**Delay:** ${delayText}\n**Role:** ${role}\n\nMember baru akan mendapatkan role ini setelah ${delayText} bergabung.`)
                .setColor('#00ff88')
                .setFooter({ text: 'by anos?!' })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error menyimpan data:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('Terjadi kesalahan saat menyimpan data!')
                .setColor('#ff0000')
                .setTimestamp();

            await message.reply({ embeds: [errorEmbed] });
        }
    }
};