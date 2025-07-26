const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

function getAllCommands() {
    const commandsPath = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file !== 'listfit.js');
    
    const commands = [];
    
    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandsPath, file));
            if (command.name && command.description && command.usage) {
                commands.push({
                    name: command.name,
                    description: command.description,
                    usage: command.usage
                });
            }
        } catch (error) {
            console.error(`Error loading command ${file}:`, error);
        }
    }
    
    return commands;
}

function createCommandPages(commands) {
    const pages = [];
    const commandsPerPage = 5;
    
    for (let i = 0; i < commands.length; i += commandsPerPage) {
        const pageCommands = commands.slice(i, i + commandsPerPage);
        
        const embed = new EmbedBuilder()
            .setTitle('🎯 Bot Command List')
            .setDescription('Berikut adalah daftar semua command yang tersedia:')
            .setColor(0x00ff88)
            .setThumbnail('https://cdn.discordapp.com/emojis/1234567890123456789.png')
            .setFooter({ 
                text: `Developer: anos6501 | Page ${Math.floor(i / commandsPerPage) + 1}/${Math.ceil(commands.length / commandsPerPage)}`,
                iconURL: 'https://cdn.discordapp.com/emojis/1234567890123456789.png'
            })
            .setTimestamp();

        pageCommands.forEach(cmd => {
            embed.addFields({
                name: `!${cmd.name}`,
                value: `📝 **Deskripsi:** ${cmd.description}\n🔧 **Usage:** \`${cmd.usage}\``,
                inline: false
            });
        });

        if (i === 0) {
            embed.addFields({
                name: '📢 Join Server Kami!',
                value: 'Bergabunglah dengan server Discord kami untuk mendapatkan update terbaru, info bot, dan bantuan lebih lanjut!\n[**Klik disini untuk join!**](https://discord.gg/y8jYv2ZgJ7)',
                inline: false
            });
        }

        pages.push(embed);
    }
    
    return pages;
}

function createSupportEmbed() {
    const embed = new EmbedBuilder()
        .setTitle('💖 Support Developer')
        .setDescription('Bantu developer untuk terus mengembangkan bot ini agar bisa lebih lama hidup dan lebih bagus!')
        .setColor(0xff6b9d)
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890123456789.png')
        .addFields(
            {
                name: '☕ Donation',
                value: 'Kamu bisa mendukung dengan donasi melalui:\n• **Saweria:** [saweria.co/anos6501](https://saweria.co/anos6501)',
                inline: false
            },
            {
                name: '⭐ Rating & Review',
                value: 'Berikan rating dan review untuk bot ini di platform bot ANOS seperti top.gg',
                inline: false
            },
            {
                name: '📢 Share & Invite',
                value: 'Bagikan bot ini kepada teman-teman dan server lainnya untuk membantu perkembangan bot',
                inline: false
            },
            {
                name: '🐛 Bug Report',
                value: 'Laporkan bug atau berikan saran untuk perbaikan bot melalui server Discord kami',
                inline: false
            }
        )
        .setFooter({ 
            text: 'Developer: anos6501 | Terima kasih atas dukungannya! 💝',
            iconURL: 'https://cdn.discordapp.com/emojis/1234567890123456789.png'
        })
        .setTimestamp();

    return embed;
}

function createNavigationButtons(currentPage, totalPages) {
    const row = new ActionRowBuilder();
    
    if (totalPages > 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('listfit_prev')
                .setLabel('◀️ Previous')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId('listfit_next')
                .setLabel('Next ▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages - 1)
        );
    }
    
    row.addComponents(
        new ButtonBuilder()
            .setCustomId('listfit_support')
            .setLabel('💖 Support Dev')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('listfit_server')
            .setLabel('🏠 Join Server')
            .setStyle(ButtonStyle.Primary)
    );
    
    return row;
}

module.exports = {
    name: 'listfit',
    description: 'Menampilkan semua command dan fitur bot',
    usage: '!listfit',

    async execute(message, args) {
        const commands = getAllCommands();
        
        if (commands.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('❌ No Commands Found')
                .setDescription('Tidak ada command yang ditemukan!')
                .setColor(0xff0000)
                .setFooter({ text: 'Developer: anos6501' })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }

        const pages = createCommandPages(commands);
        let currentPage = 0;

        const navigationRow = createNavigationButtons(currentPage, pages.length);

        const response = await message.reply({
            embeds: [pages[currentPage]],
            components: [navigationRow]
        });

        const collector = response.createMessageComponentCollector({
            time: 300000
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ 
                    content: 'Hanya yang menggunakan command ini yang bisa menggunakan tombol!', 
                    ephemeral: true 
                });
            }

            if (interaction.customId === 'listfit_prev') {
                currentPage = Math.max(0, currentPage - 1);
                const newRow = createNavigationButtons(currentPage, pages.length);
                await interaction.update({
                    embeds: [pages[currentPage]],
                    components: [newRow]
                });
            } else if (interaction.customId === 'listfit_next') {
                currentPage = Math.min(pages.length - 1, currentPage + 1);
                const newRow = createNavigationButtons(currentPage, pages.length);
                await interaction.update({
                    embeds: [pages[currentPage]],
                    components: [newRow]
                });
            } else if (interaction.customId === 'listfit_support') {
                const supportEmbed = createSupportEmbed();
                await interaction.reply({ 
                    embeds: [supportEmbed], 
                    ephemeral: true 
                });
            } else if (interaction.customId === 'listfit_server') {
                const serverEmbed = new EmbedBuilder()
                    .setTitle('🏠 Join Server Discord Kami!')
                    .setDescription('Bergabunglah dengan server Discord oficial kami untuk:\n\n• 📢 Update terbaru bot\n• 🔧 Bantuan dan support\n• 💬 Diskusi dengan komunitas\n• 🎉 Event dan giveaway\n• 🐛 Report bug dan saran')
                    .setColor(0x5865f2)
                    .addFields({
                        name: '🔗 Link Server',
                        value: '[**Klik disini untuk join server!**](https://discord.gg/y8jYv2ZgJ7)',
                        inline: false
                    })
                    .setFooter({ 
                        text: 'Developer: anos6501 | Selamat datang di komunitas kami!',
                        iconURL: 'https://cdn.discordapp.com/emojis/1234567890123456789.png'
                    })
                    .setTimestamp();
                
                await interaction.reply({ 
                    embeds: [serverEmbed], 
                    ephemeral: true 
                });
            }
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    ...navigationRow.components.map(button => 
                        ButtonBuilder.from(button).setDisabled(true)
                    )
                );
            
            try {
                await response.edit({ components: [disabledRow] });
            } catch (error) {
                console.error('Error disabling buttons:', error);
            }
        });
    },
};