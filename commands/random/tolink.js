const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

module.exports = {
    name: 'tolink',
    description: 'Konversi file menjadi link Qu.ax',
    aliases: ['filelink', 'upload'],
    cooldown: 5,
    
    async execute(message, args) {
        if (!message.attachments.size) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('Silakan lampirkan file yang ingin dikonversi menjadi link!')
                .setTimestamp();
            
            return message.reply({ embeds: [errorEmbed] });
        }
        
        const loadingEmbed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle('⏳ Memproses...')
            .setDescription('Sedang mengupload file ke Qu.ax, mohon tunggu...')
            .setTimestamp();
        
        const loadingMessage = await message.reply({ embeds: [loadingEmbed] });
        
        const attachment = message.attachments.first();
        
        try {
            const tempDir = path.join(os.tmpdir(), 'discord-tolink');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const fileExtension = path.extname(attachment.name);
            const tempFilePath = path.join(tempDir, `${uuidv4()}${fileExtension}`);
            
            const response = await axios.get(attachment.url, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            fs.writeFileSync(tempFilePath, response.data);
            
            const formData = new FormData();
            formData.append('files[]', fs.createReadStream(tempFilePath));
            
            const uploadResponse = await axios.post('https://qu.ax/upload.php', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'User-Agent': 'DiscordBot/1.0'
                },
                timeout: 60000
            });
            
            if (!uploadResponse.data || !uploadResponse.data.files || !uploadResponse.data.files[0]) {
                throw new Error('Respons upload tidak valid dari server');
            }
            
            const fileUrl = uploadResponse.data.files[0].url;
            
            const successEmbed = new EmbedBuilder()
                .setColor('#00b0f4')
                .setTitle('✅ File Berhasil Diupload')
                .setDescription('File telah berhasil dikonversi menjadi link!')
                .addFields(
                    { name: '📁 Nama File', value: attachment.name, inline: true },
                    { name: '📊 Ukuran File', value: formatBytes(attachment.size), inline: true },
                    { name: '🔗 Link Download', value: `[Klik disini untuk download](${fileUrl})` }
                )
                .addFields(
                    { name: '🌐 URL Langsung', value: `\`${fileUrl}\`` }
                )
                .setTimestamp()
                .setFooter({ 
                    text: 'QuaxLink Service • File akan tersimpan permanent', 
                    iconURL: message.client.user.displayAvatarURL() 
                });
            
            await loadingMessage.edit({ embeds: [successEmbed] });
            
            fs.unlinkSync(tempFilePath);
            
        } catch (error) {
            console.error('Error dalam command tolink:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Terjadi Kesalahan')
                .setDescription('Gagal mengupload file ke server. Silakan coba lagi!')
                .addFields(
                    { name: '🔍 Detail Error', value: `\`\`\`${error.message.substring(0, 900)}\`\`\`` },
                    { name: '💡 Saran', value: 'Pastikan file tidak terlalu besar (max 100MB) dan koneksi internet stabil' }
                )
                .setTimestamp();
            
            await loadingMessage.edit({ embeds: [errorEmbed] });
        }
    }
};

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}