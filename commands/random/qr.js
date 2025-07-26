const QRCode = require('qrcode');
const { AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'qr',
    description: 'Membuat QR code dari teks, angka, atau link',
    aliases: ['qrcode', 'qr-code'],
    cooldown: 5,

    async execute(message, args) {
        if (!args.length) {
            return message.reply('Tolong berikan teks, angka, atau link untuk dijadikan QR code!\nContoh: `!qr https://google.com`');
        }

        const konten = args.join(' ');
        let warna = '#000000';
        let background = '#FFFFFF';

        const warnaArg = args.find(arg => arg.includes('warna:'));
        const backgroundArg = args.find(arg => arg.includes('bg:'));

        if (warnaArg) {
            const warnaValue = warnaArg.split('warna:')[1];
            if (warnaValue && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(warnaValue)) {
                warna = warnaValue;
            }
        }

        if (backgroundArg) {
            const backgroundValue = backgroundArg.split('bg:')[1];
            if (backgroundValue && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(backgroundValue)) {
                background = backgroundValue;
            }
        }

        const cleanContent = konten
            .replace(/warna:#[A-Fa-f0-9]{3,6}/g, '')
            .replace(/bg:#[A-Fa-f0-9]{3,6}/g, '')
            .trim();

        if (!cleanContent) {
            return message.reply('Konten QR code tidak boleh kosong!');
        }

        const loadingMsg = await message.reply('🔄 Sedang membuat QR code...');

        try {
            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const qrFileName = `qrcode_${Date.now()}_${message.author.id}.png`;
            const qrFilePath = path.join(tempDir, qrFileName);

            const qrOptions = {
                color: {
                    dark: warna,
                    light: background
                },
                width: 500,
                margin: 2,
                errorCorrectionLevel: 'H'
            };

            await QRCode.toFile(qrFilePath, cleanContent, qrOptions);

            const attachment = new AttachmentBuilder(qrFilePath, { name: 'qrcode.png' });

            await loadingMsg.edit({
                content: `✅ QR Code untuk: \`${cleanContent.length > 50 ? cleanContent.substring(0, 50) + '...' : cleanContent}\``,
                files: [attachment]
            });

            setTimeout(() => {
                try {
                    if (fs.existsSync(qrFilePath)) {
                        fs.unlinkSync(qrFilePath);
                    }
                } catch (err) {
                    console.error(`Gagal menghapus file temporary: ${err}`);
                }
            }, 15000);

        } catch (error) {
            console.error(`Error saat membuat QR code: ${error}`);
            await loadingMsg.edit('❌ Terjadi kesalahan saat membuat QR code. Silakan coba lagi.');
        }
    }
};