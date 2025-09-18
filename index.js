const { Client, GatewayIntentBits, Collection, MessageFlags, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution
    ]
});

const prefix = '!';

const GITHUB_TOKEN = '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';
const GITHUB_REPO = 'anos-rgb/anos_dc';
const GITHUB_API_BASE = 'https://api.github.com';

class AutoBackupSystem {
    constructor() {
        this.backupInterval = 2 * 60 * 1000;
        this.isRunning = false;
        this.backupCount = 0;
        this.startBackup();
    }

    getFilesToBackup() {
        const filesToBackup = [];
        const ignoredFiles = ['node_modules', '.git', '.env', 'logs', 'temp', '.cache', '.npm', 'commands', 'event', 'media', 'utils', 'config.json', 'index.js', 'package-lock.json', 'package.json'];
        const scanDirectory = (dir) => {
            try {
                const items = fs.readdirSync(dir);
                
                items.forEach(item => {
                    const fullPath = path.join(dir, item);
                    const relativePath = path.relative(process.cwd(), fullPath);
                    
                    if (ignoredFiles.some(ignored => relativePath.includes(ignored))) {
                        return;
                    }
                    
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        scanDirectory(fullPath);
                    } else {
                        filesToBackup.push({
                            path: relativePath.replace(/\\/g, '/'),
                            fullPath: fullPath
                        });
                    }
                });
            } catch (error) {
                console.error(`Error scanning directory ${dir}:`, error.message);
            }
        };

        scanDirectory(process.cwd());
        return filesToBackup;
    }

    encodeFileToBase64(filePath) {
        try {
            const fileContent = fs.readFileSync(filePath);
            return fileContent.toString('base64');
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error.message);
            return null;
        }
    }

    async getFileSHA(filePath) {
        try {
            const response = await axios.get(
                `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${filePath}`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            return response.data.sha;
        } catch (error) {
            return null;
        }
    }

    async uploadFileToGitHub(file) {
        try {
            const content = this.encodeFileToBase64(file.fullPath);
            if (!content) return false;

            const sha = await this.getFileSHA(file.path);
            const timestamp = new Date().toISOString();
            
            const payload = {
                message: `Auto backup: ${file.path} - ${timestamp}`,
                content: content,
                branch: 'main'
            };

            if (sha) {
                payload.sha = sha;
            }

            const response = await axios.put(
                `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${file.path}`,
                payload,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`✅ Backup berhasil: ${file.path}`);
            return true;
        } catch (error) {
            console.error(`❌ Error backup ${file.path}:`, error.response?.data || error.message);
            return false;
        }
    }

    async createBackupManifest(files) {
        const manifest = {
            timestamp: new Date().toISOString(),
            backupCount: this.backupCount,
            totalFiles: files.length,
            serverInfo: {
                platform: process.platform,
                nodeVersion: process.version,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage()
            },
            files: files.map(f => ({
                path: f.path,
                size: fs.statSync(f.fullPath).size,
                modified: fs.statSync(f.fullPath).mtime
            }))
        };

        const manifestContent = Buffer.from(JSON.stringify(manifest, null, 2)).toString('base64');
        const sha = await this.getFileSHA('backup-manifest.json');

        const payload = {
            message: `Auto backup manifest - ${manifest.timestamp}`,
            content: manifestContent,
            branch: 'main'
        };

        if (sha) {
            payload.sha = sha;
        }

        try {
            await axios.put(
                `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/backup-manifest.json`,
                payload,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ Backup manifest berhasil dibuat');
        } catch (error) {
            console.error('❌ Error membuat backup manifest:', error.response?.data || error.message);
        }
    }

    async performBackup() {
        if (this.isRunning) {
            console.log('🔄 Backup sedang berjalan, melewati backup cycle ini...');
            return;
        }

        this.isRunning = true;
        this.backupCount++;
        
        console.log(`🚀 Memulai backup otomatis #${this.backupCount} - ${new Date().toISOString()}`);
        
        try {
            const files = this.getFilesToBackup();
            console.log(`📁 Ditemukan ${files.length} file untuk di-backup`);

            let successCount = 0;
            let errorCount = 0;

            for (const file of files) {
                const success = await this.uploadFileToGitHub(file);
                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            await this.createBackupManifest(files);

            console.log(`✅ Backup #${this.backupCount} selesai! Success: ${successCount}, Error: ${errorCount}`);
            
        } catch (error) {
            console.error('❌ Error saat backup:', error);
        } finally {
            this.isRunning = false;
        }
    }

    startBackup() {
        console.log('🔧 Auto backup system diaktifkan - backup setiap 2 menit');
        
        setTimeout(() => {
            this.performBackup();
        }, 5000);

        setInterval(() => {
            this.performBackup();
        }, this.backupInterval);
    }

    async getBackupStatus() {
        try {
            const response = await axios.get(
                `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/backup-manifest.json`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            const content = Buffer.from(response.data.content, 'base64').toString('utf8');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }
}

const backupSystem = new AutoBackupSystem();

client.commands = new Collection();
client.cooldowns = new Collection();
client.data = new Map();
client.invites = new Map();

client.db = {
    save: function(data) {
        fs.writeFileSync('./data/database.json', JSON.stringify(data, null, 2));
    },
    load: function() {
        if (!fs.existsSync('./data/database.json')) {
            const defaultDB = {
                users: {},
                item_toko: [
                    {
                        "id": "admin_magang",
                        "nama": "Role Admin Magang",
                        "harga": 1000000,
                        "deskripsi": "Role admin magang bergengsi yang cuma beberapa orang punya!",
                        "stok": 3
                    },
                    {
                        "id": "role_vip",
                        "nama": "Role VIP",
                        "harga": 50000,
                        "deskripsi": "Role VIP buat requests warna role mu",
                        "stok": -1
                    },
                    {
                        "id": "warna_merah",
                        "nama": "Role Warna Merah",
                        "harga": 19000,
                        "deskripsi": "Biar username lo keliatan kece dengan warna merah!",
                        "stok": -1
                    },
                    {
                        "id": "warna_biru",
                        "nama": "Role Warna Biru",
                        "harga": 18500,
                        "deskripsi": "Warna biru yang menenangkan untuk username kamu!",
                        "stok": -1
                    },
                    {
                        "id": "warna_hijau",
                        "nama": "Role Warna Hijau",
                        "harga": 18500,
                        "deskripsi": "Hijau fresh yang bikin username kamu stand out!",
                        "stok": -1
                    },
                    {
                        "id": "warna_ungu",
                        "nama": "Role Warna Ungu",
                        "harga": 12000,
                        "deskripsi": "Warna ungu royal yang elegan dan mewah!",
                        "stok": -1
                    },
                    {
                        "id": "warna_emas",
                        "nama": "Role Warna Emas",
                        "harga": 27000,
                        "deskripsi": "Warna emas yang berkilau! Limited edition color!",
                        "stok": 8
                    },
                    {
                        "id": "fishing_rod",
                        "nama": "Fishing Rod++",
                        "harga": 18000,
                        "deskripsi": "Pancing kece buat naikin persentase dapet ikan langka!",
                        "stok": 10
                    }
                ],
                statistik_game: {
                    penghasilan_harian: 0,
                    total_transaksi: 0
                }
            };
            this.save(defaultDB);
            return defaultDB;
        }
        return JSON.parse(fs.readFileSync('./data/database.json'));
    }
};

function loadGuildData(guildId) {
    const filePath = path.join(__dirname, 'data', `${guildId}.json`);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        client.data.set(guildId, data);
        return data;
    }
    const defaultData = {
        welcomeChannel: null,
        welcomech: null,
        goodbyeChannel: null,
        goodbyech: null,
        registerChannel: null,
        registerRole: null,
        antiLink: false,
        allowedLinks: [],
        gameRoles: [],
        gameRoleChannel: null,
        randomRoles: [],
        randomRoleMenus: [],
        adminRole: null,
        nameRequests: {},
        deleteLogChannel: null,
        reactRoles: {},
        welcomeMessage: null,
        goodbyeMessage: null
    };
    client.data.set(guildId, defaultData);
    saveGuildData(guildId, defaultData);
    return defaultData;
}

function saveGuildData(guildId, data) {
    const filePath = path.join(__dirname, 'data', `${guildId}.json`);
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    client.data.set(guildId, data);
}

async function updateInviteCache(guild) {
    try {
        const invites = await guild.invites.fetch();
        const inviteMap = new Map();
        invites.forEach(invite => {
            inviteMap.set(invite.code, invite.uses);
        });
        client.invites.set(guild.id, inviteMap);
    } catch (error) {
        console.error(`Error updating invite cache for guild ${guild.id}:`, error);
    }
}

client.loadGuildData = loadGuildData;
client.saveGuildData = saveGuildData;
client.backupSystem = backupSystem;

function loadCommands(dir) {
    const commandFolders = fs.readdirSync(dir);
    
    for (const folder of commandFolders) {
        const folderPath = path.join(dir, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                
                if ('name' in command && 'execute' in command) {
                    client.commands.set(command.name, command);
                    console.log(`✅ Command ${command.name} berhasil dimuat!`);
                } else {
                    console.log(`❌ Command di ${filePath} ga valid!`);
                }
            }
        }
    }
}

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        if (command.name) {
            client.commands.set(command.name, command);
            console.log(`Loaded command: ${command.name}`);
        } else {
            console.warn(`Command file ${file} tidak memiliki nama command`);
        }
    } catch (error) {
        console.error(`Error loading command ${file}:`, error);
    }
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    try {
        const event = require(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`Loaded event: ${event.name}`);
    } catch (error) {
        console.error(`Error loading event ${file}:`, error);
    }
}

client.once('ready', async () => {
    console.log(`Bot online sebagai ${client.user.tag}!`);
    console.log(`Bot ID: ${client.user.id}`);
    console.log(`Terhubung ke ${client.guilds.cache.size} server(s)`);
    console.log(`Prefix: ${prefix}`);
    console.log(`🔄 Auto backup system aktif - backup setiap 2 menit ke GitHub`);
    loadCommands(path.join(__dirname, 'commands'));
    client.database = client.db.load();
    
    for (const guild of client.guilds.cache.values()) {
        await updateInviteCache(guild);
        console.log(`Updated invite cache for guild: ${guild.name}`);
    }
});

client.on('guildCreate', async (guild) => {
    console.log(`Bot bergabung ke server baru: ${guild.name}`);
    await updateInviteCache(guild);
});

client.on('inviteCreate', async (invite) => {
    const cachedInvites = client.invites.get(invite.guild.id) || new Map();
    cachedInvites.set(invite.code, invite.uses);
    client.invites.set(invite.guild.id, cachedInvites);
});

client.on('inviteDelete', async (invite) => {
    const cachedInvites = client.invites.get(invite.guild.id) || new Map();
    cachedInvites.delete(invite.code);
    client.invites.set(invite.guild.id, cachedInvites);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commandName === 'backup-status') {
        try {
            const status = await backupSystem.getBackupStatus();
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔄 Status Auto Backup System')
                .addFields([
                    { name: 'Status', value: backupSystem.isRunning ? '🟢 Running' : '🔴 Idle', inline: true },
                    { name: 'Total Backup', value: `${backupSystem.backupCount}`, inline: true },
                    { name: 'Interval', value: '2 menit', inline: true }
                ]);
            
            if (status) {
                embed.addFields([
                    { name: 'Last Backup', value: new Date(status.timestamp).toLocaleString('id-ID'), inline: true },
                    { name: 'Total Files', value: `${status.totalFiles}`, inline: true }
                ]);
            }
            
            return message.reply({ embeds: [embed] });
        } catch (error) {
            return message.reply('❌ Error mengambil status backup!');
        }
    }

    const command = client.commands.get(commandName);
    if (!command) return;

    if (command.cooldown) {
        if (!client.cooldowns.has(command.name)) {
            client.cooldowns.set(command.name, new Collection());
        }
        
        const now = Date.now();
        const timestamps = client.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
        
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Sabar dikit napa, masih cooldown ${timeLeft.toFixed(1)} detik lagi buat command \`${command.name}\`!`);
            }
        }
        
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    if (!client.database.users[message.author.id] && commandName !== 'register') {
        const embed = new EmbedBuilder()
            .setColor('#FF5555')
            .setTitle('❌ Belom register Cuy!')
            .setDescription(`Lo belom terdaftar, ketik \`${prefix}register\` dulu buat mulai!`)
            .setFooter({ text: 'EkonomiBot Kece' });
            
        return message.reply({ embeds: [embed] });
    }

    try {
        console.log(`Executing command: ${commandName} by ${message.author.tag}`);
        await command.execute(message, args, client);
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        try {
            await message.reply('Terjadi error saat menjalankan command!');
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
});

async function handleNameChangeRequest(interaction, client) {
    const requestId = interaction.customId.replace('accept_cn_', '').replace('reject_cn_', '');
    const isAccept = interaction.customId.startsWith('accept_cn_');
    
    let guild = interaction.guild;
    let guildData;
    
    if (!guild) {
        for (const [guildId, data] of client.data) {
            if (data.nameRequests && data.nameRequests[requestId]) {
                guild = client.guilds.cache.get(guildId);
                guildData = data;
                break;
            }
        }
        
        if (!guild) {
            return interaction.reply({ 
                content: '❌ Server tidak ditemukan atau permintaan sudah kadaluarsa!', 
                flags: MessageFlags.Ephemeral 
            });
        }
    } else {
        guildData = client.loadGuildData(guild.id);
    }
    
    if (!guildData.nameRequests || !guildData.nameRequests[requestId]) {
        return interaction.reply({ 
            content: '❌ Permintaan tidak ditemukan atau sudah diproses!', 
            flags: MessageFlags.Ephemeral 
        });
    }

    const request = guildData.nameRequests[requestId];
    
    if (request.status !== 'pending') {
        return interaction.reply({ 
            content: '❌ Permintaan sudah diproses sebelumnya!', 
            flags: MessageFlags.Ephemeral 
        });
    }

    try {
        const targetUser = await client.users.fetch(request.userId);
        const targetMember = guild.members.cache.get(request.userId);

        if (isAccept) {
            if (targetMember) {
                await targetMember.setNickname(request.requestedName);
            }

            const acceptEmbed = {
                title: '✅ Permintaan Ganti Nama Diterima',
                description: `udah gw aceceh tu njing .\n\n**Nama Baru:** ${request.requestedName}`,
                color: 0x00ff00,
                footer: {
                    text: 'Nama kamu telah berhasil diubah'
                },
                timestamp: new Date()
            };

            await targetUser.send({ embeds: [acceptEmbed] });
            request.status = 'accepted';
            await interaction.reply({ content: `✅ Permintaan diterima! Nama **${targetUser.tag}** berhasil diubah ke **${request.requestedName}**`, flags: MessageFlags.Ephemeral });
        } else {
            const rejectEmbed = {
                title: '❌ Permintaan Ganti Nama Ditolak',
                description: `mau ganti nama jadi **${request.requestedName}** ya?.\n\nganti ajah sendiri anje**😂.`,
                color: 0xff0000,
                footer: {
                    text: 'Kamu bisa mengajukan permintaan baru dengan nama yang berbeda'
                },
                timestamp: new Date()
            };

            await targetUser.send({ embeds: [rejectEmbed] });
            request.status = 'rejected';
            await interaction.reply({ content: `❌ Permintaan ditolak! **${targetUser.tag}** telah diberi tahu.`, flags: MessageFlags.Ephemeral });
        }

        client.saveGuildData(guild.id, guildData);
    } catch (error) {
        console.error('Error processing name request:', error);
        await interaction.reply({ content: '❌ Terjadi error saat memproses permintaan!', flags: MessageFlags.Ephemeral });
    }
}

async function handleRandomRole(interaction, client) {
    const guildData = client.loadGuildData(interaction.guild.id);
    
    if (!guildData.randomRoles || guildData.randomRoles.length === 0) {
        return interaction.reply({ 
            content: '❌ Tidak ada random role yang tersedia!', 
            flags: MessageFlags.Ephemeral 
        });
    }

    const availableRoles = guildData.randomRoles.filter(roleId => {
        const role = interaction.guild.roles.cache.get(roleId);
        return role && !interaction.member.roles.cache.has(roleId);
    });

    if (availableRoles.length === 0) {
        return interaction.reply({ 
            content: '❌ Kamu sudah memiliki semua role yang tersedia!', 
            flags: MessageFlags.Ephemeral 
        });
    }

    const randomRoleId = availableRoles[Math.floor(Math.random() * availableRoles.length)];
    const randomRole = interaction.guild.roles.cache.get(randomRoleId);

    try {
        await interaction.member.roles.add(randomRole);
        
        const embed = {
            title: '🎲 Random Role Berhasil!',
            description: `Kamu mendapatkan role **${randomRole.name}**!`,
            color: randomRole.color || 0x00ff00,
            footer: {
                text: 'Selamat menikmati role baru kamu!'
            },
            timestamp: new Date()
        };

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error('Error giving random role:', error);
        await interaction.reply({ 
            content: '❌ Terjadi error saat memberikan role!', 
            flags: MessageFlags.Ephemeral 
        });
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    try {
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('accept_cn_') || interaction.customId.startsWith('reject_cn_')) {
                await handleNameChangeRequest(interaction, client);
                return;
            }

            if (!interaction.guild) {
                return interaction.reply({ 
                    content: 'Command ini hanya bisa digunakan di server!', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            if (interaction.customId === 'randomrole') {
                await handleRandomRole(interaction, client);
                return;
            }

            if (interaction.customId.startsWith('game_role_')) {
                const roleId = interaction.customId.replace('game_role_', '');
                const role = interaction.guild.roles.cache.get(roleId);
                
                if (!role) {
                    return interaction.reply({ content: 'Role tidak ditemukan!', flags: MessageFlags.Ephemeral });
                }

                const member = interaction.member;
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    await interaction.reply({ content: `Role **${role.name}** telah dihapus!`, flags: MessageFlags.Ephemeral });
                } else {
                    await member.roles.add(roleId);
                    await interaction.reply({ content: `Role **${role.name}** telah ditambahkan!`, flags: MessageFlags.Ephemeral });
                }
            }
        }

        if (interaction.isStringSelectMenu()) {
            if (!interaction.guild) {
                return interaction.reply({ 
                    content: 'Command ini hanya bisa digunakan di server!', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            if (interaction.customId === 'game_role_select') {
                const roleId = interaction.values[0];
                const role = interaction.guild.roles.cache.get(roleId);
                
                if (!role) {
                    return interaction.reply({ content: 'Role tidak ditemukan!', flags: MessageFlags.Ephemeral });
                }

                const member = interaction.member;
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    await interaction.reply({ content: `Role **${role.name}** telah dihapus!`, flags: MessageFlags.Ephemeral });
                } else {
                    await member.roles.add(roleId);
                    await interaction.reply({ content: `Role **${role.name}** telah ditambahkan!`, flags: MessageFlags.Ephemeral });
                }
            }

            if (interaction.customId === 'random_role_select') {
                const guildData = client.loadGuildData(interaction.guild.id);
                
                if (interaction.values[0] === 'get_random') {
                    await handleRandomRole(interaction, client);
                } else {
                    const roleId = interaction.values[0];
                    const role = interaction.guild.roles.cache.get(roleId);
                    
                    if (!role) {
                        return interaction.reply({ content: 'Role tidak ditemukan!', flags: MessageFlags.Ephemeral });
                    }

                    const member = interaction.member;
                    if (member.roles.cache.has(roleId)) {
                        await member.roles.remove(roleId);
                        await interaction.reply({ content: `Role **${role.name}** telah dihapus!`, flags: MessageFlags.Ephemeral });
                    } else {
                        await member.roles.add(roleId);
                        await interaction.reply({ content: `Role **${role.name}** telah ditambahkan!`, flags: MessageFlags.Ephemeral });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error handling interaction:', error);
        const replyOptions = { 
            content: 'Terjadi error saat memproses permintaan!', 
            flags: MessageFlags.Ephemeral 
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
});

setInterval(() => {
    client.guilds.cache.forEach(guild => {
        const data = client.loadGuildData(guild.id);
        if (data.randomRoles && data.randomRoles.length > 0) {
            data.randomRoles.forEach(async roleData => {
                const role = guild.roles.cache.get(roleData.roleId);
                const channel = guild.channels.cache.get(roleData.channelId);
                
                if (role && channel) {
                    const embed = {
                        title: '🎮 Reminder Registrasi!',
                        description: `Jangan lupa untuk registrasi dengan mengetik:\n\`\`\`reg [nama kamu]\`\`\`\nDi channel ${channel}`,
                        color: 0x00ff00,
                        timestamp: new Date()
                    };
                    
                    channel.send({ embeds: [embed] }).catch(console.error);
                }
            });
        }
    });
}, 3600000);

client.on('error', error => {
    console.error('Client error:', error);
});

client.on('warn', warn => {
    console.warn('Client warning:', warn);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

client.login(config.token).catch(error => {
    console.error('Error saat login:', error);
    if (error.code === 'TokenInvalid') {
        console.error('Token tidak valid! Periksa kembali token di config.json');
    }
});
