const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const BAD_WORDS = [
    'anjing', 'bangsat', 'babi', 'kontol', 'memek', 'ngentot', 'tai', 'sial', 'keparat', 'bajingan', 'goblok', 'tolol', 'pantek', 'peler'
];

const TIMEOUT_DURATION = 60000;
const WARNING_LIMIT = 5;
const AUTO_DELETE_DELAY = 8000;
const RESET_WARNING_TIME = 300000;

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;
        if (message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const guildData = client.loadGuildData(message.guild.id);

        try {
            await this.handleAntiLink(message, guildData);
            await this.handleRegistration(message, guildData);
            await this.handleBadWords(message);
        } catch (error) {
            console.error('Error in message handler:', error);
        }
    },

    async handleAntiLink(message, guildData) {
        if (!guildData.antiLink) return;

        const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|id|co\.id|gov|edu|io)[^\s]*)/gi;
        const links = message.content.match(linkRegex);
        
        if (!links) return;

        const hasDisallowedLink = links.some(link => {
            try {
                let url = link;
                if (!url.startsWith('http')) {
                    url = 'https://' + url;
                }
                const parsedUrl = new URL(url);
                const domain = parsedUrl.hostname.replace(/^www\./, '');
                return !guildData.allowedLinks.includes(domain);
            } catch {
                return true;
            }
        });

        if (hasDisallowedLink) {
            await this.deleteMessage(message);
            await this.sendTemporaryEmbed(message.channel, {
                title: '🚫 Link Terdeteksi!',
                description: `${message.author}, link tidak diizinkan di server ini!`,
                color: 0xff0000,
                footer: { text: 'Anti Link System' }
            });
        }
    },

    async handleRegistration(message, guildData) {
        if (!guildData.registerChannel || message.channel.id !== guildData.registerChannel) {
            return;
        }

        const regexPattern = /^(reg|Reg|REG)\s+(.+)$/;
        const match = message.content.match(regexPattern);
        
        if (!match) return;

        const newName = match[2].trim();
        if (newName.length < 2 || newName.length > 32) {
            return message.reply('❌ Nama harus 2-32 karakter!');
        }

        const role = message.guild.roles.cache.get(guildData.registerRole);
        
        if (!role) {
            return message.reply('❌ Role registrasi tidak ditemukan!');
        }

        if (message.member.roles.cache.has(role.id)) {
            return message.reply('❌ Kamu sudah terdaftar!');
        }

        try {
            await Promise.all([
                message.member.setNickname(newName).catch(() => {}),
                message.member.roles.add(role)
            ]);
            
            await message.reply({
                embeds: [{
                    title: '✅ Registrasi Berhasil!',
                    description: `Selamat ${message.author}!\n\n**Nama:** ${newName}\n**Role:** ${role.name}`,
                    color: 0x00ff00,
                    thumbnail: { url: message.author.displayAvatarURL({ dynamic: true }) },
                    footer: { text: 'Selamat bergabung!' },
                    timestamp: new Date()
                }]
            });
        } catch (error) {
            console.error('Registration error:', error);
            message.reply('❌ Terjadi error saat registrasi!');
        }
    },

    async handleBadWords(message) {
        const config = await this.loadConfig();
        
        if (!this.isAntiKasarEnabled(config, message.guild.id)) return;

        const messageContent = message.content.toLowerCase()
            .replace(/[0-9@#$%^&*()_+=\[\]{}|\\:";'<>?,./`~\-]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        const containsBadWord = BAD_WORDS.some(word => {
            const normalizedWord = word.toLowerCase();
            
            if (messageContent.includes(normalizedWord)) return true;
            
            const wordPattern = normalizedWord.split('').join('[^a-zA-Z]*');
            const regex = new RegExp(wordPattern, 'i');
            return regex.test(messageContent);
        });

        if (!containsBadWord) return;

        await this.deleteMessage(message);

        const updatedConfig = await this.incrementWarning(config, message.guild.id, message.author.id);
        const warningData = updatedConfig.antiKasar[message.guild.id].warnings[message.author.id];
        const warningCount = warningData.count;

        if (warningCount >= WARNING_LIMIT) {
            await this.handleTimeout(message, updatedConfig);
        } else {
            await this.sendWarning(message, warningCount);
        }

        await this.sendDM(message, warningCount);
    },

    async loadConfig() {
        const configPath = path.join(process.cwd(), 'config.json');
        
        try {
            const data = await fs.readFile(configPath, 'utf8');
            return JSON.parse(data);
        } catch {
            return {};
        }
    },

    async saveConfig(config) {
        const configPath = path.join(process.cwd(), 'config.json');
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    },

    isAntiKasarEnabled(config, guildId) {
        return config.antiKasar?.[guildId]?.enabled === true;
    },

    async incrementWarning(config, guildId, userId) {
        if (!config.antiKasar) config.antiKasar = {};
        if (!config.antiKasar[guildId]) config.antiKasar[guildId] = {};
        if (!config.antiKasar[guildId].warnings) config.antiKasar[guildId].warnings = {};
        
        const now = Date.now();
        const userWarnings = config.antiKasar[guildId].warnings[userId];
        
        if (!userWarnings || (now - userWarnings.lastWarning) > RESET_WARNING_TIME) {
            config.antiKasar[guildId].warnings[userId] = {
                count: 1,
                lastWarning: now
            };
        } else {
            config.antiKasar[guildId].warnings[userId].count += 1;
            config.antiKasar[guildId].warnings[userId].lastWarning = now;
        }
        
        await this.saveConfig(config);
        return config;
    },

    async handleTimeout(message, config) {
        try {
            const member = await message.guild.members.fetch(message.author.id);
            await member.timeout(TIMEOUT_DURATION, `Anti-toxic: ${WARNING_LIMIT}x pelanggaran`);

            config.antiKasar[message.guild.id].warnings[message.author.id] = {
                count: 0,
                lastWarning: Date.now()
            };
            await this.saveConfig(config);

            const timeoutEmbed = new EmbedBuilder()
                .setColor('#FF4444')
                .setTitle('🔇 AUTO TIMEOUT')
                .setDescription(`${message.author} telah di-timeout selama 1 menit karena melanggar aturan bahasa!`)
                .addFields(
                    { name: '⚠️ Alasan', value: 'Menggunakan bahasa tidak pantas berulang kali', inline: true },
                    { name: '⏰ Durasi', value: '1 Menit', inline: true },
                    { name: '🔄 Reset', value: 'Warning direset otomatis', inline: true }
                )
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: 'Anti-Toxic System' })
                .setTimestamp();

            await this.sendTemporaryMessage(message.channel, { embeds: [timeoutEmbed] }, 10000);
        } catch (error) {
            console.error('Timeout error:', error);
        }
    },

    async sendWarning(message, warningCount) {
        const warningEmbed = new EmbedBuilder()
            .setColor('#FFAA00')
            .setTitle('⚠️ PERINGATAN AUTO DELETE')
            .setDescription(`${message.author} pesanmu dihapus karena mengandung bahasa tidak pantas!`)
            .addFields(
                { name: '📊 Warning', value: `${warningCount}/${WARNING_LIMIT}`, inline: true },
                { name: '⚡ Info', value: `${WARNING_LIMIT}x warning = timeout 1 menit`, inline: true },
                { name: '🔄 Reset', value: 'Warning direset dalam 5 menit', inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: 'Anti-Toxic System' })
            .setTimestamp();

        await this.sendTemporaryMessage(message.channel, { embeds: [warningEmbed] });
    },

    async sendDM(message, warningCount) {
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('⚠️ Pesan Dihapus Otomatis')
                .setDescription(`Pesanmu di **${message.guild.name}** telah dihapus karena mengandung bahasa yang tidak pantas.`)
                .addFields(
                    { name: '📝 Pesan', value: `\`${message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content}\``, inline: false },
                    { name: '📊 Warning', value: `${warningCount}/${WARNING_LIMIT}`, inline: true },
                    { name: '💡 Tips', value: 'Gunakan bahasa yang sopan dan santun!', inline: true },
                    { name: '🔄 Info', value: 'Warning akan direset otomatis dalam 5 menit', inline: false }
                )
                .setFooter({ text: 'Anti-Toxic System' })
                .setTimestamp();

            await message.author.send({ embeds: [dmEmbed] });
        } catch {
            console.log('Cannot send DM to user');
        }
    },

    async deleteMessage(message) {
        try {
            await message.delete();
        } catch (error) {
            console.error('Delete message error:', error);
        }
    },

    async sendTemporaryEmbed(channel, embedData) {
        await this.sendTemporaryMessage(channel, { embeds: [embedData] });
    },

    async sendTemporaryMessage(channel, messageData, delay = AUTO_DELETE_DELAY) {
        try {
            const msg = await channel.send(messageData);
            setTimeout(() => msg.delete().catch(() => {}), delay);
        } catch (error) {
            console.error('Send temporary message error:', error);
        }
    }
};