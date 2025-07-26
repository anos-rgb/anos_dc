const { EmbedBuilder } = require('discord.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'topup',
    description: 'Top-up saldo dengan uang asli',
    aliases: ['donasi', 'donate'],
    cooldown: 10,
    async execute(message, args, client) {
        // Cek apakah user ada di database
        if (!client.database.users[message.author.id]) {
            client.database.users[message.author.id] = {
                statistik: { command_digunakan: 0 }
            };
        }
        
        const userData = client.database.users[message.author.id];
        
        // Cek jika tidak ada argumen
        if (!args.length) {
            const helpEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('💳 Top-Up Saldo')
                .setDescription('Top-up saldo dengan uang asli untuk dapetin koin lebih banyak!')
                .addFields(
                    { name: 'Rate', value: '5.000 IDR = 500.000 koin', inline: false },
                    { name: 'Metode Pembayaran', value: '- Bank Transfer\n- E-Wallet (Dana, OVO, Gopay)\n- QRIS', inline: false },
                    { name: 'Cara Top-Up', value: '1. Ketik `!topup [jumlah]`\n2. Lo bakal dikirimin detail pembayaran\n3. Setelah bayar, kirim bukti ke admin\n4. Saldo lo bakal ditambah setelah pembayaran dikonfirmasi', inline: false }
                )
                .setFooter({ text: 'Minimal top-up: 1.000 IDR' });
                
            return message.reply({ embeds: [helpEmbed] });
        }
        
        // Parse jumlah topup
        const amount = parseInt(args[0]);
        
        // Validasi jumlah
        if (isNaN(amount) || amount < 1000) {
            return message.reply('❌ Minimal top-up adalah 1.000 IDR!');
        }
        
        // Nomor tujuan
        const nomor = '083834946034';
        
        // Buat link QR
        const qrLink = `https://www.hotelmurah.com/pulsa/Ewallet/detailOrder?nomor=${nomor}&amount=${amount}`;
        
        // Buat directory untuk file QR temporary jika tidak ada
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Generate file QR
        const qrFilePath = path.join(tempDir, `qr-${message.author.id}-${Date.now()}.png`);
        
        try {
            // Generate QR code
            await qrcode.toFile(qrFilePath, qrLink);
            
            // Hitung koin yang akan didapatkan
            const coins = (amount / 5000) * 500000;
            
            // Buat embed untuk respons
            const topupEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('💰 Pembayaran Top-Up')
                .setDescription(`**Detail Pembayaran:**`)
                .addFields(
                    { name: 'Jumlah', value: `${amount.toLocaleString('id-ID')} IDR`, inline: true },
                    { name: 'Koin yang Didapatkan', value: `${coins.toLocaleString('id-ID')} koin`, inline: true },
                    { name: 'Nomor Tujuan', value: nomor, inline: false },
                    { name: 'Metode Pembayaran', value: 'Bank Transfer, Dana, OVO, Gopay, QRIS', inline: false },
                    { name: 'Langkah Pembayaran', value: '1. Buka web https://www.hotelmurah.com/pulsa/top-up-dana\n2. masukkan nomor dan polih nominal\n3. Kirim bukti pembayaran ke admin\n4. Koin akan ditambahkan ke akun kamu', inline: false }
                )
                .setImage('attachment://qrcode.png')
                .setFooter({ text: 'Minimal top-up: 1.000 IDR' })
                .setTimestamp();
                
            // Kirim respons ke user
            await message.reply({ content: `✅ Detail pembayaran telah dikirim, silakan cek!` });
            
            // Kirim QR code dan embed ke DM
            await message.author.send({ 
                embeds: [topupEmbed],
                files: [{ attachment: qrFilePath, name: 'qrcode.png' }]
            });
            
            // Tambah counter command digunakan
            userData.statistik.command_digunakan = (userData.statistik.command_digunakan || 0) + 1;
            client.database.save();
            
            // Hapus file QR setelah dikirim
            setTimeout(() => {
                fs.unlinkSync(qrFilePath);
            }, 5000);
            
        } catch (error) {
            console.error('Error dalam proses top-up:', error);
            message.reply('❌ Terjadi kesalahan saat memproses top-up. Silakan coba lagi nanti.');
        }
    }
};