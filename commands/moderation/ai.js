const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');

module.exports = {
    name: 'ai',
    description: 'Tanya ke AI tentang apapun',
    
    async execute(message, args) {
        if (!args.length) {
            const noArgsEmbed = new EmbedBuilder()
                .setTitle('❌ Pesan Kosong')
                .setDescription('Silakan masukkan pesan yang ingin ditanyakan ke AI!\nContoh: `!ai Apa itu Discord?`')
                .setColor('#ff0000')
                .setTimestamp();
            
            return await message.reply({ embeds: [noArgsEmbed] });
        }

        const typing = await message.channel.sendTyping();

        try {
            const userMessage = args.join(' ');
            const guild = message.guild;
            const channel = message.channel;
            const member = message.member;

            const serverInfo = {
                serverName: guild.name,
                serverMemberCount: guild.memberCount,
                channelName: channel.name,
                channelType: channel.type,
                userName: member.displayName,
                userRoles: member.roles.cache.map(role => role.name).join(', '),
                isAdmin: member.permissions.has('ADMINISTRATOR'),
                isModerator: member.permissions.has('MANAGE_MESSAGES') || member.permissions.has('MANAGE_CHANNELS'),
                serverBoostLevel: guild.premiumTier,
                serverCreatedAt: guild.createdAt.toDateString()
            };

            const systemPrompt = `lu itu ANOS BOT, asisten AI yg ramah & ngebantu di server "${serverInfo.serverName}"

info server skrg:
- server: ${serverInfo.serverName} (${serverInfo.serverMemberCount} member)
- channel: #${serverInfo.channelName}
- user: ${serverInfo.userName}
- role user: ${serverInfo.userRoles}
- status: ${serverInfo.isAdmin ? 'Administrator' : serverInfo.isModerator ? 'Moderator' : 'Member'}
- boost lvl: ${serverInfo.serverBoostLevel}
- dibuat: ${serverInfo.serverCreatedAt}
- waktu skrg: ${new Date().toLocaleString('id-ID')}

gaya ngomong:
- pake bhs indo santai, kek lg ngobrol sama temen
- panggil user pake namanya langsung
- boleh pake emoji biar seru & ga kaku
- jawab singkat tapi padet & jelas
- kalo ditanya soal server, pake info di atas
- kalo ngomong sama admin/mod, tetep hormatin
- selalu ramah, supportif, & helpful
- hindari formal banget, santai aja
- kalo user curhat, dengerin & kasih support

bisa ngapain?
- bantu pertanyaan umum tentang apapun
- kasih saran buat server management
- bantu masalah teknis discord simple
- share tips & trik discord
- bisa ngelawak ato kasih fakta unik
- bantu moderasi kalo diminta admin/mod
- kasih info bot commands yg ada
- jelasin fitur server
- bantu newcomer biar betah
- kasih rekomendasi channel/role

personality:
- friendly & approachable
- helpful tapi ga sok tau
- bisa serius kalo perlu
- suka becanda tapi tau batas
- supportif ke semua member
- loyal sama server
- update terus sama trend discord
- paham kultur gaming & internet indo

jangan lupa:
- selalu cek role user sebelum ngasih akses tertentu
- kalo ada drama, tetep netral
- lapor ke admin kalo ada masalah serius
- jaga privasi user
- ga ngasih info sensitif sembarangan

jawab semua dgn gaya friendly & informatif 😎`;

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama3-8b-8192',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user', 
                        content: userMessage
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${config.groqApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const aiResponse = response.data.choices[0].message.content;

            const embed = new EmbedBuilder()
                .setTitle('🤖 ANOS BOT Assistant')
                .setDescription(aiResponse)
                .setColor('#00ff88')
                .setFooter({ 
                    text: `Ditanya oleh ${member.displayName} • Powered by Groq AI developed by anos6501`,
                    iconURL: member.user.displayAvatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error dengan AI command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('Maaf, terjadi kesalahan saat memproses permintaan AI. Coba lagi nanti ya!')
                .setColor('#ff0000')
                .setTimestamp();

            await message.reply({ embeds: [errorEmbed] });
        }
    }
};