const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: 'stalktiktok',
    description: 'Stalk dan dapatkan informasi lengkap akun TikTok + video recent',
    aliases: ['ttstalk', 'tiktokstalk', 'ttinfo', 'tikstalk'],
    cooldown: 8,

    async execute(message, args) {
        if (!args.length) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0050')
                        .setTitle('❌ Username Diperlukan')
                        .setDescription('**Cara pakai:**\n`>stalktiktok <username>`\n`>stalktiktok <username> videos` (untuk lihat video terbaru)\n\n**Contoh:**\n`>stalktiktok charlidamelio`\n`>stalktiktok khaby00 videos`')
                        .addFields(
                            { name: '💡 Tips', value: '• Jangan pakai @ di depan username\n• Gunakan parameter `videos` untuk lihat video recent\n• Bot ini work 24/7!' }
                        )
                        .setTimestamp()
                ]
            });
        }

        let username = args[0].toLowerCase().replace(/[@]/g, '');
        const showVideos = args[1] === 'videos';
        
        const loadingEmbed = new EmbedBuilder()
            .setColor('#FF0050')
            .setTitle('🔍 Sedang Stalking...')
            .setDescription(`🕵️ Mengumpulkan intel lengkap untuk @${username}...\n⏳ Data profil, statistik, ${showVideos ? 'video terbaru, ' : ''}dll\n🚀 Sabar bro, lagi nge-hack TikTok server...`)
            .setThumbnail('https://cdn.discordapp.com/attachments/placeholder/loading.gif')
            .setTimestamp();

        const loadingMsg = await message.reply({ embeds: [loadingEmbed] });

        try {
            const userInfo = await this.getUserInfo(username);
            const recentVideos = showVideos ? await this.getRecentVideos(username) : [];

            if (!userInfo) {
                throw new Error('User tidak ditemukan atau data kosong');
            }

            const embed = this.createProfileEmbed(userInfo, message.author, showVideos, recentVideos);
            const components = this.createActionButtons(username, userInfo);

            await loadingMsg.edit({ 
                embeds: [embed], 
                components: components 
            });

        } catch (error) {
            const errorEmbed = this.createErrorEmbed(error, username);
            await loadingMsg.edit({ embeds: [errorEmbed] });
        }
    },

    async getUserInfo(username) {
        const apiEndpoints = [
            {
                url: `https://api.tiklydown.eu.org/api/user/info?username=${username}`,
                parser: (data) => this.parseApiResponse1(data)
            },
            {
                url: `https://tiktok.livecounts.io/user/data/${username}`,
                parser: (data) => this.parseApiResponse2(data)
            },
            {
                url: `https://api.tiktokv.com/aweme/v1/user/?username=${username}`,
                parser: (data) => this.parseApiResponse3(data)
            }
        ];

        const scrapingEndpoints = [
            `https://www.tiktok.com/@${username}`,
            `https://tikstats.org/@${username}`,
            `https://exolyt.com/user/${username}`,
            `https://tokcount.com/@${username}`,
            `https://tikrank.com/@${username}`,
            `https://socialblade.com/tiktok/user/${username}`,
            `https://hypeauditor.com/tiktok/${username}`,
            `https://tiklytics.com/@${username}`,
            `https://pentos.com/tiktok-user/${username}`,
            `https://analisa.io/profile/${username}`,
            `https://tokboard.com/@${username}`,
            `https://tikstars.net/@${username}`,
            `https://tiktokanalytics.net/user/${username}`,
            `https://trendtok.app/user/${username}`,
            `https://tikfame.com/user/${username}`,
            `https://tiktokmetrics.com/@${username}`,
            `https://tikdata.io/user/${username}`,
            `https://tiktokstats.org/@${username}`
        ];

        for (const endpoint of apiEndpoints) {
            try {
                const response = await axios.get(endpoint.url, {
                    timeout: 12000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': 'https://www.tiktok.com/',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (response.data) {
                    const parsed = endpoint.parser(response.data);
                    if (parsed) return parsed;
                }
            } catch (error) {
                console.log(`API ${endpoint.url} failed:`, error.message);
                continue;
            }
        }

        for (const url of scrapingEndpoints) {
            try {
                const scraped = await this.scrapeUserData(url, username);
                if (scraped) return scraped;
            } catch (error) {
                console.log(`Scraping ${url} failed:`, error.message);
                continue;
            }
        }

        return null;
    },

    async scrapeUserData(url, username) {
        try {
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
            ];

            const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': randomUA,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0'
                }
            });

            const $ = cheerio.load(response.data);
            
            // Method 1: TikTok Official Data
            const scriptTags = $('script').get();
            for (let script of scriptTags) {
                const content = $(script).html();
                
                // Pattern 1: UNIVERSAL_DATA_FOR_REHYDRATION
                if (content && content.includes('webapp.user-detail')) {
                    const match = content.match(/window\.__UNIVERSAL_DATA_FOR_REHYDRATION__\s*=\s*({.*?});/);
                    if (match) {
                        try {
                            const data = JSON.parse(match[1]);
                            const userDetail = data?.default?.["webapp.user-detail"]?.userInfo;
                            if (userDetail?.user) {
                                return this.parseScrapedData(userDetail);
                            }
                        } catch (e) { continue; }
                    }
                }

                // Pattern 2: SIGI_STATE
                if (content && content.includes('SIGI_STATE')) {
                    const match = content.match(/window\['SIGI_STATE'\]\s*=\s*({.*?});/);
                    if (match) {
                        try {
                            const data = JSON.parse(match[1]);
                            const userInfo = data?.UserModule?.users;
                            if (userInfo) {
                                const userId = Object.keys(userInfo)[0];
                                if (userId && userInfo[userId]) {
                                    return this.parseScrapedData({ user: userInfo[userId], stats: data.UserModule.stats?.[userId] });
                                }
                            }
                        } catch (e) { continue; }
                    }
                }

                // Pattern 3: __NEXT_DATA__
                if (content && content.includes('__NEXT_DATA__')) {
                    const match = content.match(/window\.__NEXT_DATA__\s*=\s*({.*?});/);
                    if (match) {
                        try {
                            const data = JSON.parse(match[1]);
                            const props = data?.props?.pageProps;
                            if (props?.userInfo) {
                                return this.parseScrapedData(props);
                            }
                        } catch (e) { continue; }
                    }
                }
            }

            // Method 2: Meta Tags Scraping
            const metaData = this.scrapeMeta($, username);
            if (metaData) return metaData;

            // Method 3: JSON-LD Scraping
            const jsonLD = this.scrapeJsonLD($, username);
            if (jsonLD) return jsonLD;

            // Method 4: API-like endpoints scraping
            const apiData = await this.scrapeAPILike(url, username);
            if (apiData) return apiData;

            return null;
        } catch (error) {
            console.log(`Scraping ${url} failed:`, error.message);
            return null;
        }
    },

    scrapeMeta($, username) {
        try {
            const title = $('title').text();
            const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content');
            const image = $('meta[property="og:image"]').attr('content');
            
            if (!title.includes(username)) return null;

            // Extract followers from title/description
            const followerMatch = (title + ' ' + description).match(/(\d+(?:[\.,]\d+)*)\s*(?:followers?|pengikut)/i);
            const followingMatch = (title + ' ' + description).match(/(\d+(?:[\.,]\d+)*)\s*(?:following|mengikuti)/i);
            const likesMatch = (title + ' ' + description).match(/(\d+(?:[\.,]\d+)*)\s*(?:likes?|suka)/i);

            return {
                username: username,
                nickname: title.split('|')[0]?.trim() || username,
                avatar: image,
                signature: description || '',
                verified: title.includes('✓') || description.includes('verified'),
                private: description.includes('private') || description.includes('pribadi'),
                follower_count: followerMatch ? this.parseNumber(followerMatch[1]) : 0,
                following_count: followingMatch ? this.parseNumber(followingMatch[1]) : 0,
                heart_count: likesMatch ? this.parseNumber(likesMatch[1]) : 0,
                video_count: 0,
                id: null,
                region: null
            };
        } catch (error) {
            return null;
        }
    },

    scrapeJsonLD($, username) {
        try {
            const jsonLDScript = $('script[type="application/ld+json"]').html();
            if (!jsonLDScript) return null;

            const data = JSON.parse(jsonLDScript);
            if (data['@type'] === 'Person' || data['@type'] === 'ProfilePage') {
                return {
                    username: username,
                    nickname: data.name || username,
                    avatar: data.image || null,
                    signature: data.description || '',
                    verified: false,
                    private: false,
                    follower_count: data.interactionStatistic?.find(stat => stat.interactionType?.includes('Follow'))?.userInteractionCount || 0,
                    following_count: 0,
                    heart_count: 0,
                    video_count: 0,
                    id: data.identifier || null,
                    region: null
                };
            }
        } catch (error) {
            return null;
        }
    },

    async scrapeAPILike(baseUrl, username) {
        try {
            const domain = new URL(baseUrl).hostname;
            const possibleEndpoints = [
                `https://${domain}/api/user/${username}`,
                `https://${domain}/api/users/${username}`,
                `https://${domain}/api/profile/${username}`,
                `https://${domain}/api/v1/user/${username}`,
                `https://${domain}/api/v2/user/${username}`,
                `https://${domain}/user/${username}/data`,
                `https://${domain}/user/${username}.json`,
                `https://${domain}/profile/${username}/stats`
            ];

            for (const endpoint of possibleEndpoints) {
                try {
                    const response = await axios.get(endpoint, {
                        timeout: 8000,
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    if (response.data && typeof response.data === 'object') {
                        const parsed = this.parseGenericAPIResponse(response.data, username);
                        if (parsed) return parsed;
                    }
                } catch (e) {
                    continue;
                }
            }
        } catch (error) {
            return null;
        }
    },

    parseGenericAPIResponse(data, username) {
        try {
            const user = data.user || data.profile || data.data || data;
            
            if (!user || typeof user !== 'object') return null;

            return {
                username: user.username || user.unique_id || user.handle || username,
                nickname: user.nickname || user.display_name || user.name || username,
                avatar: user.avatar || user.avatar_url || user.profile_pic || user.image,
                signature: user.signature || user.bio || user.description || '',
                verified: user.verified || user.is_verified || false,
                private: user.private || user.is_private || user.private_account || false,
                follower_count: user.follower_count || user.followers || user.follower || 0,
                following_count: user.following_count || user.following || user.follows || 0,
                heart_count: user.heart_count || user.likes || user.total_likes || user.like_count || 0,
                video_count: user.video_count || user.videos || user.post_count || user.aweme_count || 0,
                id: user.id || user.user_id || user.uid || null,
                region: user.region || user.country || user.location || null
            };
        } catch (error) {
            return null;
        }
    },

    parseNumber(str) {
        if (!str) return 0;
        const cleanStr = str.toString().replace(/[^\d.,]/g, '');
        const number = parseFloat(cleanStr.replace(/,/g, ''));
        return isNaN(number) ? 0 : Math.floor(number);
    },

    async getRecentVideos(username) {
        try {
            const response = await axios.get(`https://api.tiklydown.eu.org/api/user/posts?username=${username}&count=6`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
                }
            });

            return response.data?.videos?.slice(0, 6) || [];
        } catch (error) {
            return [];
        }
    },

    parseApiResponse1(data) {
        const user = data.user_info || data.user;
        const stats = data.user_stats || data.stats || user;
        
        if (!user) return null;

        return {
            username: user.username || user.unique_id,
            nickname: user.nickname,
            avatar: user.avatar_larger || user.avatar_thumb,
            signature: user.signature,
            verified: user.verified || false,
            private: user.private_account || false,
            follower_count: stats.follower_count || 0,
            following_count: stats.following_count || 0,
            heart_count: stats.heart_count || 0,
            video_count: stats.video_count || 0,
            id: user.id || user.sec_uid,
            region: user.region,
            create_time: user.create_time,
            web_url: user.web_url
        };
    },

    parseApiResponse2(data) {
        if (!data.user) return null;

        return {
            username: data.user.username,
            nickname: data.user.displayName,
            avatar: data.user.avatar,
            signature: data.user.bio,
            verified: data.user.verified,
            private: data.user.private,
            follower_count: data.stats?.followers || 0,
            following_count: data.stats?.following || 0,
            heart_count: data.stats?.likes || 0,
            video_count: data.stats?.videos || 0,
            id: data.user.id,
            region: data.user.country
        };
    },

    parseApiResponse3(data) {
        const user = data.user;
        if (!user) return null;

        return {
            username: user.unique_id,
            nickname: user.nickname,
            avatar: user.avatar_larger?.url_list?.[0],
            signature: user.signature,
            verified: user.custom_verify !== "",
            private: user.secret === 1,
            follower_count: user.follower_count || 0,
            following_count: user.following_count || 0,
            heart_count: user.total_favorited || 0,
            video_count: user.aweme_count || 0,
            id: user.uid,
            region: user.region
        };
    },

    parseScrapedData(userDetail) {
        const user = userDetail.user;
        const stats = userDetail.stats;

        return {
            username: user.uniqueId,
            nickname: user.nickname,
            avatar: user.avatarLarger,
            signature: user.signature,
            verified: user.verified,
            private: user.privateAccount,
            follower_count: stats.followerCount,
            following_count: stats.followingCount,
            heart_count: stats.heartCount,
            video_count: stats.videoCount,
            id: user.id,
            region: user.region
        };
    },

    createProfileEmbed(userInfo, author, showVideos, recentVideos) {
        const formatNumber = (num) => {
            if (!num) return '0';
            const number = parseInt(num);
            if (number >= 1000000000) return (number / 1000000000).toFixed(1) + 'B';
            if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
            if (number >= 1000) return (number / 1000).toFixed(1) + 'K';
            return number.toString();
        };

        const getEngagementRate = () => {
            if (!userInfo.heart_count || !userInfo.follower_count) return 'N/A';
            const rate = (userInfo.heart_count / userInfo.follower_count * 100).toFixed(2);
            return `${rate}%`;
        };

        const getAccountAge = () => {
            if (!userInfo.create_time) return 'Tidak diketahui';
            const created = new Date(userInfo.create_time * 1000);
            const now = new Date();
            const diffTime = Math.abs(now - created);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 365) {
                return `${Math.floor(diffDays / 365)} tahun`;
            } else if (diffDays > 30) {
                return `${Math.floor(diffDays / 30)} bulan`;
            } else {
                return `${diffDays} hari`;
            }
        };

        const statusIcon = userInfo.verified ? '✅' : userInfo.private ? '🔒' : '🔓';
        const accountStatus = userInfo.verified ? 'Terverifikasi' : userInfo.private ? 'Private' : 'Public';

        const embed = new EmbedBuilder()
            .setColor('#FF0050')
            .setTitle(`🕵️ Intel Report: @${userInfo.username}`)
            .setDescription(`**${userInfo.nickname || userInfo.username}** ${statusIcon}\n${userInfo.signature || '*Tidak ada bio*'}`)
            .setThumbnail(userInfo.avatar || null)
            .addFields(
                { 
                    name: '📊 Statistik Utama', 
                    value: `👥 **${formatNumber(userInfo.follower_count)}** followers\n👤 **${formatNumber(userInfo.following_count)}** following\n❤️ **${formatNumber(userInfo.heart_count)}** total likes\n📹 **${formatNumber(userInfo.video_count)}** videos`, 
                    inline: true 
                },
                { 
                    name: '🎯 Analisis Akun', 
                    value: `📈 **Engagement:** ${getEngagementRate()}\n🎭 **Status:** ${accountStatus}\n⏰ **Umur Akun:** ${getAccountAge()}\n🌍 **Region:** ${userInfo.region || 'Global'}`, 
                    inline: true 
                },
                { 
                    name: '🔍 Detail Teknis', 
                    value: `🆔 **User ID:** \`${userInfo.id || 'Hidden'}\`\n📱 **Username:** @${userInfo.username}\n🔗 **Profile:** [Buka TikTok](https://tiktok.com/@${userInfo.username})`, 
                    inline: false 
                }
            );

        if (showVideos && recentVideos.length > 0) {
            const videoList = recentVideos.map((video, index) => 
                `${index + 1}. [${video.title?.substring(0, 40) || 'Video'}...](${video.play_url}) (${formatNumber(video.play_count)} views)`
            ).join('\n');
            
            embed.addFields({ 
                name: '🎬 Video Terbaru', 
                value: videoList || 'Tidak ada video ditemukan', 
                inline: false 
            });
        }

        embed.setFooter({ 
            text: `🚀 Intel berhasil dikumpulkan • Request by ${author.username}`, 
            iconURL: author.displayAvatarURL() 
        })
        .setTimestamp();

        return embed;
    },

    createActionButtons(username, userInfo) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Buka Profil')
                    .setURL(`https://tiktok.com/@${username}`)
                    .setEmoji('🔗'),
                new ButtonBuilder()
                    .setCustomId(`stalk_videos_${username}`)
                    .setLabel('Lihat Videos')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎬'),
                new ButtonBuilder()
                    .setCustomId(`stalk_refresh_${username}`)
                    .setLabel('Refresh Data')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔄')
            );

        return [row];
    },

    createErrorEmbed(error, username) {
        let errorMessage = 'Gagal mengambil informasi akun TikTok.';
        let errorCode = 'UNKNOWN_ERROR';

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
            errorMessage = 'Koneksi bermasalah. Coba lagi nanti.';
            errorCode = 'CONNECTION_ERROR';
        } else if (error.response?.status === 404) {
            errorMessage = `Username @${username} tidak ditemukan atau akun sudah dihapus.`;
            errorCode = 'USER_NOT_FOUND';
        } else if (error.response?.status === 429) {
            errorMessage = 'Rate limit! Terlalu banyak request. Tunggu 1-2 menit.';
            errorCode = 'RATE_LIMITED';
        } else if (error.response?.status === 403) {
            errorMessage = 'Akun private atau diblokir dari scraping.';
            errorCode = 'ACCESS_DENIED';
        }

        return new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Stalking Gagal!')
            .setDescription(`**Error:** ${errorMessage}\n**Code:** \`${errorCode}\``)
            .addFields(
                { 
                    name: '💡 Tips Troubleshooting', 
                    value: '• Pastikan username benar (tanpa @)\n• Cek apakah akun masih ada\n• Tunggu beberapa menit jika rate limited\n• Coba dengan username lain dulu\n• Report bug ke admin jika terus error' 
                },
                {
                    name: '🔧 Alternative',
                    value: `Coba manual: [Buka @${username}](https://tiktok.com/@${username})`
                }
            )
            .setTimestamp();
    }
};