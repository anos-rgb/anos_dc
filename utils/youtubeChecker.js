const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

class YouTubeNotifier {
    constructor(client) {
        this.client = client;
        this.dataPath = path.join(__dirname, '../data/youtube_notifications.json');
        this.messagesPath = path.join(__dirname, '../data/youtube_messages.json');
        this.checkInterval = 60 * 1000;
        this.start();
    }

    async start() {
        await this.initializeDatabase();
        await this.checkAllChannels();
        setInterval(() => this.checkAllChannels(), this.checkInterval);
    }

    async initializeDatabase() {
        if (!fs.existsSync(this.dataPath)) {
            fs.writeFileSync(this.dataPath, JSON.stringify([], null, 2));
        }
        if (!fs.existsSync(this.messagesPath)) {
            const defaultMessages = {
                video: '📹 **{author}** just uploaded a video:\n**{title}**\n🔗 {url}',
                short: '⚡ **{author}** just uploaded a short:\n**{title}**\n🔗 {url}',
                live: '🔴 **{author}** is live right now:\n**{title}**\n🔗 {url}',
                upcoming: '⏰ **{author}** will go live:\n**{title}**\n🔗 {url}'
            };
            fs.writeFileSync(this.messagesPath, JSON.stringify(defaultMessages, null, 2));
        }
    }

    async checkAllChannels() {
        const notifications = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        
        for (const notif of notifications) {
            try {
                let channelId = notif.channelId;
                
                if (!channelId || !channelId.startsWith('UC')) {
                    console.log(`Resolving channel ID for: ${notif.url}`);
                    channelId = await this.getRealChannelId(notif.url);
                    if (!channelId) {
                        console.error(`Failed to get channel ID for: ${notif.url}`);
                        continue;
                    }
                    
                    notif.channelId = channelId;
                    this.saveNotifications(notifications);
                    console.log(`Saved channel ID: ${channelId}`);
                }
                
                await this.checkNewVideo(notif, notifications);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`Error processing ${notif.url}:`, error.message);
            }
        }
    }

    saveNotifications(notifications) {
        fs.writeFileSync(this.dataPath, JSON.stringify(notifications, null, 2));
    }

    async getRealChannelId(url) {
        const username = url.split('@')[1];
        const methods = [
            () => this.fetchFromYouTubeDirect(username || url),
            () => this.fetchFromInvidiousInstances(username),
            () => this.fetchFromLemnoslife(username),
            () => this.scrapeFromYouTube(url)
        ];
        
        for (const method of methods) {
            try {
                const id = await method();
                if (id && id.startsWith('UC')) {
                    console.log(`Successfully got channel ID: ${id}`);
                    return id;
                }
            } catch (error) {
                console.error(`Method failed:`, error.message);
            }
        }
        
        return null;
    }

    async fetchFromYouTubeDirect(username) {
        const cleanUsername = username.replace('@', '');
        const targetUrl = `https://www.youtube.com/@${cleanUsername}`;
        
        const res = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });
        
        const channelIdMatch = res.data.match(/"channelId":"(UC[\w-]{22})"/);
        const externalIdMatch = res.data.match(/"externalId":"(UC[\w-]{22})"/);
        
        return channelIdMatch?.[1] || externalIdMatch?.[1];
    }

    async fetchFromInvidiousInstances(username) {
        const instances = [
            'https://invidious.fdn.fr',
            'https://inv.riverside.rocks',
            'https://invidious.sethforprivacy.com',
            'https://vid.puffyan.us',
            'https://invidious.tiekoetter.com'
        ];

        for (const instance of instances) {
            try {
                const res = await axios.get(`${instance}/api/v1/channels/@${username}`, {
                    timeout: 8000
                });
                const channelId = res.data?.authorId;
                if (channelId && channelId.startsWith('UC')) {
                    return channelId;
                }
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    async fetchFromLemnoslife(username) {
        try {
            const res = await axios.get(`https://yt.lemnoslife.com/channels?handle=@${username}`, {
                timeout: 8000
            });
            return res.data?.items?.[0]?.id;
        } catch (error) {
            const res = await axios.get(`https://yt.lemnoslife.com/noKey/channels?part=id&forUsername=${username}`, {
                timeout: 8000
            });
            return res.data?.items?.[0]?.id;
        }
    }

    async scrapeFromYouTube(url) {
        const targetUrl = url.includes('@') ? url : `https://youtube.com/@${url}`;
        const res = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 15000
        });
        
        const patterns = [
            /"channelId":"(UC[\w-]{22})"/,
            /"externalId":"(UC[\w-]{22})"/,
            /channel\/(UC[\w-]{22})/,
            /"browseId":"(UC[\w-]{22})"/
        ];
        
        for (const pattern of patterns) {
            const match = res.data.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        return null;
    }

    async checkNewVideo(notif, notifications) {
        const videos = await this.getLatestVideos(notif.channelId);
        if (!videos || videos.length === 0) {
            console.log(`No videos found for channel: ${notif.channelId}`);
            return;
        }

        console.log(`Found ${videos.length} videos for channel ${notif.channelId}`);

        const sortedVideos = videos.sort((a, b) => {
            const dateA = new Date(a.publishedText || a.publishedAt || 0);
            const dateB = new Date(b.publishedText || b.publishedAt || 0);
            return dateB - dateA;
        });

        if (!notif.lastVideoId) {
            notif.lastVideoId = sortedVideos[0].videoId;
            notif.lastCheckTime = new Date().toISOString();
            this.saveNotifications(notifications);
            console.log(`Initial setup - set last video ID to: ${sortedVideos[0].videoId} without notification`);
            return;
        }

        const newVideos = [];
        for (const video of sortedVideos) {
            if (video.videoId === notif.lastVideoId) {
                break;
            }
            
            const publishDate = new Date(video.publishedText || video.publishedAt || 0);
            const lastCheck = new Date(notif.lastCheckTime || 0);
            
            if (publishDate > lastCheck) {
                newVideos.push(video);
            }
        }

        if (newVideos.length === 0) {
            console.log(`No new videos found for channel ${notif.channelId}`);
            return;
        }

        console.log(`Found ${newVideos.length} new videos`);

        for (const video of newVideos.reverse()) {
            if (!video || !video.videoId) {
                console.log('Skipping invalid video data');
                continue;
            }
            
            console.log(`Sending notification for NEW video: ${video.title}`);
            await this.sendNotification(notif, video);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        notif.lastVideoId = sortedVideos[0].videoId;
        notif.lastCheckTime = new Date().toISOString();
        this.saveNotifications(notifications);
        console.log(`Updated last video ID to: ${sortedVideos[0].videoId}`);
    }

    isYouTubeShort(video) {
        if (!video) return false;
        
        const duration = parseInt(video.lengthSeconds) || 0;
        const title = (video.title || '').toLowerCase();
        const description = (video.description || '').toLowerCase();
        
        if (duration > 0 && duration <= 60) {
            return true;
        }
        
        if (title.includes('#shorts') || title.includes('#short')) {
            return true;
        }
        
        if (description.includes('#shorts') || description.includes('#short')) {
            return true;
        }
        
        return false;
    }

    isLiveVideo(video) {
        if (!video) return false;
        
        if (video.liveNow === true || video.isLive === true) {
            return true;
        }
        
        if (video.lengthSeconds === 0 || !video.lengthSeconds) {
            const title = (video.title || '').toLowerCase();
            if (title.includes('live') || title.includes('streaming') || title.includes('🔴')) {
                return true;
            }
        }
        
        return false;
    }

    isUpcomingLive(video) {
        if (!video) return false;
        
        if (video.premiereTimestamp || video.scheduledStartTime) {
            return true;
        }
        
        const title = (video.title || '').toLowerCase();
        if (title.includes('premiere') || title.includes('akan live') || title.includes('coming live')) {
            return true;
        }
        
        return false;
    }

    async getLatestVideos(channelId) {
        const apis = [
            () => this.fetchFromRSSFeed(channelId),
            () => this.fetchFromInvidiousInstances(channelId, 'videos'),
            () => this.fetchFromLemnoslifeApi(channelId),
            () => this.fetchFromDirectScrape(channelId)
        ];

        for (const api of apis) {
            try {
                const videos = await api();
                if (videos && videos.length > 0) {
                    console.log(`Successfully fetched ${videos.length} videos`);
                    return videos;
                }
            } catch (error) {
                console.error('API failed:', error.message);
            }
        }

        return null;
    }

    async fetchFromRSSFeed(channelId) {
        const res = await axios.get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)'
            }
        });

        const entries = res.data.match(/<entry>(.*?)<\/entry>/gs) || [];
        const videos = [];
        const authorMatch = res.data.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/) || 
                          res.data.match(/<name>(.*?)<\/name>/);
        const authorName = authorMatch ? authorMatch[1] : 'Unknown';

        for (const entry of entries.slice(0, 10)) {
            const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
            const titleMatch = entry.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || 
                              entry.match(/<title>(.*?)<\/title>/);
            const published = entry.match(/<published>(.*?)<\/published>/)?.[1];
            
            if (videoId && titleMatch) {
                const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                
                videos.push({
                    videoId: videoId,
                    title: title,
                    publishedText: published,
                    publishedAt: published,
                    lengthSeconds: null,
                    description: '',
                    author: authorName
                });
            }
        }

        console.log(`RSS Feed found ${videos.length} videos`);
        return videos;
    }

    async fetchFromInvidiousInstances(channelId, endpoint = '') {
        const instances = [
            'https://invidious.fdn.fr',
            'https://inv.riverside.rocks',
            'https://invidious.sethforprivacy.com',
            'https://vid.puffyan.us',
            'https://invidious.tiekoetter.com'
        ];

        for (const instance of instances) {
            try {
                let url;
                if (endpoint === 'videos') {
                    url = `${instance}/api/v1/channels/${channelId}/videos?sortBy=newest`;
                } else {
                    url = `${instance}/api/v1/channels/@${channelId}`;
                }

                const res = await axios.get(url, { timeout: 8000 });
                
                if (endpoint === 'videos') {
                    return res.data?.slice(0, 10);
                } else {
                    return res.data?.authorId;
                }
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    async fetchFromLemnoslifeApi(channelId) {
        try {
            const res = await axios.get(`https://yt.lemnoslife.com/channels/${channelId}/videos`, {
                timeout: 8000
            });
            return res.data?.items?.slice(0, 10);
        } catch (error) {
            const res = await axios.get(`https://yt.lemnoslife.com/noKey/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=10`, {
                timeout: 8000
            });
            return res.data?.items?.map(item => ({
                videoId: item.id?.videoId,
                title: item.snippet?.title,
                description: item.snippet?.description,
                publishedText: item.snippet?.publishedAt,
                publishedAt: item.snippet?.publishedAt
            }));
        }
    }

    async fetchFromDirectScrape(channelId) {
        const res = await axios.get(`https://www.youtube.com/channel/${channelId}/videos`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });

        const videoMatches = res.data.matchAll(/"videoId":"([\w-]{11})".*?"title":{"runs":\[{"text":"(.*?)"}.*?"lengthText":{"simpleText":"(.*?)"}/gs);
        const videos = [];

        for (const match of videoMatches) {
            if (videos.length >= 10) break;
            
            const [, videoId, title, duration] = match;
            videos.push({
                videoId: videoId,
                title: title,
                lengthSeconds: this.parseDuration(duration),
                description: '',
                publishedText: new Date().toISOString(),
                publishedAt: new Date().toISOString()
            });
        }

        return videos;
    }

    parseDuration(durationStr) {
        if (!durationStr) return null;
        
        const parts = durationStr.split(':').reverse();
        let seconds = 0;
        
        for (let i = 0; i < parts.length; i++) {
            seconds += parseInt(parts[i] || 0) * Math.pow(60, i);
        }
        
        return seconds;
    }

    async sendNotification(notif, video) {
        try {
            const channel = this.client.channels.cache.get(notif.discordChannelId);
            if (!channel) {
                console.error(`Discord channel not found: ${notif.discordChannelId}`);
                return;
            }

            if (!video.videoId || !video.title) {
                console.error('Invalid video data for notification');
                return;
            }

            const messages = this.loadCustomMessages();
            const isShort = this.isYouTubeShort(video);
            const isLive = this.isLiveVideo(video);
            const isUpcoming = this.isUpcomingLive(video);
            
            let messageType, messageTemplate, color, pingMessage;
            
            if (isUpcoming) {
                messageType = 'upcoming';
                messageTemplate = messages.upcoming;
                color = '#FFA500';
                pingMessage = '⏰ **LIVE AKAN DIMULAI!**';
            } else if (isLive) {
                messageType = 'live';
                messageTemplate = messages.live;
                color = '#FF0000';
                pingMessage = '🔴 **LIVE SEKARANG!**';
            } else if (isShort) {
                messageType = 'short';
                messageTemplate = messages.short;
                color = '#FF6B6B';
            } else {
                messageType = 'video';
                messageTemplate = messages.video;
                color = '#FF0000';
            }

            const videoUrl = `https://youtu.be/${video.videoId}`;
            const author = video.author || 'YouTube Channel';
            
            if (notif.useEmbed) {
                const title = this.sanitizeText(video.title);
                const description = video.description ? 
                    this.sanitizeText(video.description.substring(0, 200)) + '...' : 
                    'Tidak ada deskripsi';

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setURL(videoUrl)
                    .setDescription(description)
                    .setThumbnail(this.getBestThumbnail(video))
                    .setColor(color)
                    .setFooter({ text: `${author} • ${this.getTypeLabel(messageType)}` })
                    .setTimestamp();

                if (video.lengthSeconds && video.lengthSeconds > 0) {
                    embed.addFields({
                        name: 'Durasi',
                        value: this.formatDuration(video.lengthSeconds),
                        inline: true
                    });
                }

                embed.addFields({
                    name: 'Tipe',
                    value: this.getTypeLabel(messageType),
                    inline: true
                });

                const messageContent = {
                    embeds: [embed]
                };

                if (pingMessage) {
                    messageContent.content = pingMessage;
                }

                await channel.send(messageContent);
            } else {
                const customMessage = messageTemplate
                    .replace(/{title}/g, video.title)
                    .replace(/{author}/g, author)
                    .replace(/{url}/g, videoUrl)
                    .replace(/{type}/g, messageType);

                await channel.send(customMessage);
            }

            console.log(`✅ Successfully sent notification for NEW ${messageType}: ${video.title}`);

        } catch (error) {
            console.error('Failed to send notification:', error);
            
            try {
                const channel = this.client.channels.cache.get(notif.discordChannelId);
                if (channel) {
                    const isLive = this.isLiveVideo(video);
                    const isShort = this.isYouTubeShort(video);
                    const isUpcoming = this.isUpcomingLive(video);
                    
                    let prefix;
                    if (isUpcoming) {
                        prefix = '⏰ UPCOMING LIVE:';
                    } else if (isLive) {
                        prefix = '🔴 LIVE:';
                    } else if (isShort) {
                        prefix = '📱 SHORTS:';
                    } else {
                        prefix = '🎬 VIDEO BARU:';
                    }
                    
                    await channel.send(`${prefix} **${this.sanitizeText(video.title)}**\nhttps://youtu.be/${video.videoId}`);
                    console.log('✅ Sent fallback notification');
                }
            } catch (fallbackError) {
                console.error('❌ Fallback notification also failed:', fallbackError);
            }
        }
    }

    loadCustomMessages() {
        try {
            return JSON.parse(fs.readFileSync(this.messagesPath, 'utf8'));
        } catch (error) {
            return {
                video: '📹 **{author}** just uploaded a video:\n**{title}**\n🔗 {url}',
                short: '⚡ **{author}** just uploaded a short:\n**{title}**\n🔗 {url}',
                live: '🔴 **{author}** is live right now:\n**{title}**\n🔗 {url}',
                upcoming: '⏰ **{author}** will go live:\n**{title}**\n🔗 {url}'
            };
        }
    }

    getTypeLabel(type) {
        const labels = {
            video: '🎬 Video',
            short: '📱 YouTube Shorts',
            live: '🔴 Live Stream',
            upcoming: '⏰ Upcoming Live'
        };
        return labels[type] || '📹 Content';
    }

    sanitizeText(text) {
        if (!text) return '';
        
        return text
            .replace(/[*_`~|\\]/g, '\\$&')
            .replace(/\n/g, ' ')
            .trim()
            .substring(0, 256);
    }

    getBestThumbnail(video) {
        if (!video.videoId) return null;
        
        if (video.videoThumbnails && video.videoThumbnails.length > 0) {
            const high = video.videoThumbnails.find(t => t.quality === 'high' || t.quality === 'maxres');
            const medium = video.videoThumbnails.find(t => t.quality === 'medium');
            const defaultThumb = video.videoThumbnails[0];
            
            const selected = high || medium || defaultThumb;
            if (selected && selected.url) {
                return selected.url.startsWith('http') ? selected.url : `https:${selected.url}`;
            }
        }
        
        return `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
    }

    formatDuration(seconds) {
        if (!seconds || seconds === 0) return 'N/A';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    addNotification(channelUrl, discordChannelId, options = {}) {
        const notifications = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        
        const existing = notifications.find(n => 
            n.url === channelUrl && n.discordChannelId === discordChannelId
        );
        
        if (existing) {
            console.log('Notification already exists for this channel and Discord channel');
            return existing;
        }
        
        const newNotif = {
            url: channelUrl,
            channelId: null,
            channelName: options.channelName || null,
            discordChannelId: discordChannelId,
            useEmbed: options.useEmbed || false,
            lastVideoId: null,
            lastCheckTime: null,
            createdAt: new Date().toISOString()
        };
        
        notifications.push(newNotif);
        this.saveNotifications(notifications);
        console.log(`Added new notification for: ${channelUrl}`);
        return newNotif;
    }

    removeNotification(channelUrl, discordChannelId) {
        const notifications = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        const filtered = notifications.filter(n => 
            !(n.url === channelUrl && n.discordChannelId === discordChannelId)
        );
        
        this.saveNotifications(filtered);
        return notifications.length - filtered.length;
    }

    getNotifications() {
        return JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
    }
}

module.exports = YouTubeNotifier;
