const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tod',
    description: 'Truth or Dare yang bikin lo deg-degan td!',
    aliases: ['truthordare', 'td'],
    cooldown: 5,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        // Cek cooldown (30 detik biar ga spam td)
        const now = Date.now();
        const lastTod = userData.statistik.tod_terakhir || 0;
        const timeLeft = 30000 - (now - lastTod);
        
        if (lastTod && timeLeft > 0) {
            const seconds = Math.floor(timeLeft / 1000);
            return message.reply(`Eh sabar td bro! Tunggu ${seconds} detik lagi sebelum main Truth or Dare`);
        }
        
        // List truth questions yang bikin muka merah td
        const truths = [
    "Siapa orang terakhir yang kamu stalk di media sosial?",
    "Pernah naksir temen sekelas? Siapa?",
    "Chat terakhir kamu sama mantan isinya apa?",
    "Rahasia paling memalukan yang pernah kamu sembunyikan?",
    "Pernah ketahuan bohong besar sama orang tua?",
    "Hal paling cringe yang pernah kamu lakuin buat dapetin perhatian?",
    "Pernah nangis karena ditolak gebetan?",
    "Siapa yang paling sering kamu chat sampe larut malam?",
    "Pernah nyesal pacaran sama seseorang? Kenapa?",
    "DM paling awkward yang pernah kamu kirim?",
    "Pernah iri sama sahabat sendiri?",
    "Apa yang bikin kamu paling insecure?",
    "Pernah bohong demi ketemu pacar/gebetan?",
    "Status WA paling baper yang pernah kamu bikin?",
    "Pernah naksir orang yang udah punya pasangan?",
    "Kalau bisa hapus satu kenangan, apa yang akan kamu hapus?",
    "Pernah pura-pura sakit demi keluar dari acara?",
    "Kebiasaan aneh yang kamu sembunyikan dari orang lain?",
    "Pernah ketipu sama temen sendiri? Cerita!",
    "Hal terburuk yang pernah kamu lakuin ke mantan?",
    "Pernah naksir guru/dosen? Siapa?",
    "Chat yang paling kamu sesali pernah dikirim?",
    "Pernah nyontek tugas temen tanpa izin?",
    "Aplikasi paling aneh di HP kamu sekarang?",
    "Pernah ketahuan baca chat orang tanpa izin?",
    "Kapan terakhir kali kamu nangis dan kenapa?",
    "Pernah punya fake account buat stalk orang?",
    "Hal paling nekad yang pernah kamu lakuin buat gebetan?",
    "Pernah ditolak mentah-mentah waktu nembak orang?",
    "Kebohongan terbesar yang pernah kamu bilang ke sahabat?",
    "Pernah naksir temen sekantor? Gimana ceritanya?",
    "Pesan yang bikin kamu baper akhir-akhir ini?",
    "Pernah curi barang kecil-kecilan? Apa itu?",
    "Kalau besok mati, apa penyesalan terbesarmu?",
    "Pernah dihina orang dan diam aja? Cerita!",
    "Hal paling dewasa yang pernah kamu lakuin?",
    "Pernah minjem barang terus engga dikembaliin?",
    "Kebiasaan jelek yang susah banget dihilangin?",
    "Pernah naksir pacar temen? Ngaku!",
    "Chat terakhir kamu di grup keluarga isinya apa?",
    "Pernah di-bully waktu kecil? Gimana rasanya?",
    "Apa yang bikin kamu paling takut di dunia ini?",
    "Pernah ketahuan ngupil terus dimakan?",
    "Hal paling norak yang pernah kamu beli?",
    "Pernah ngerjain orang sampe mereka marah?",
    "Kalau bisa jadi invisible, mau ngelakuin apa?",
    "Pernah mimpi basah soal siapa?",
    "Hal paling gila yang pernah kamu lakuin demi balas dendam?",
    "Pernah ditagih utang tapi pura-pura lupa?",
    "Siapa orang yang paling kamu benci seumur hidup?"
    ];

const dares = [
    "Chat random ke orang di server ini bilang 'Aku suka kamu'",
    "Ganti foto profil jadi meme receh selama 24 jam",
    "Nyanyi lagu cringe di VC terus rekam dikirim kesini",
    "Post status WA dengan caption 'Yang mau pacaran DM'",
    "DM mantan bilang 'Maafin aku' terus screenshot ke sini",
    "Pake nickname 'JombloNgenes' selama 1 jam",
    "Kirim voice note bilang 'Aku ganteng/cantik kan?'",
    "Upload foto jaman kecil paling culun yang kamu punya",
    "Chat gebetan kamu bilang 'Kita cocok ga sih?'",
    "Bikin status 'Aku jomblo, yang mau serius DM'",
    "Telepon temen tengah malem bilang 'Aku mimpi buruk'",
    "Ganti wallpaper HP jadi foto orang random di server ini",
    "Chat orang terakhir di DM kamu bilang 'Kangen'",
    "Post tweet random pakai hashtag #CariJodoh",
    "Record video dance 10 detik terus kirim ke sini",
    "Chat admin server bilang 'Server ini jelek banget'",
    "Pake bahasa daerah kamu seharian di chat",
    "Bikin puisi cinta terus tag orang random",
    "Tiruin gaya jalan artis favorit kamu di depan kaca",
    "Tulis nama kamu di google search + 'ganteng/cantik'",
    "Chat orang bilang 'Aku tau rahasia kamu'",
    "Post IG story pake filter kucing tanpa caption",
    "Bilang 'I love you' ke benda pertama yang kamu pegang",
    "Tahan nafas selama 30 detik sambil streaming",
    "Minum air putih 1 gelas dalam 10 detik terus buktiin",
    "Tiruin suara ayam selama 15 detik di voice chat",
    "Push up 10x sambil nyanyi lagu nasional",
    "Tulis status pakai bahasa alien (kamu buat sendiri)",
    "Chat orang random minta dikirimin meme",
    "Bilang ke 3 orang terakhir di DM 'Kamu penting banget'",
    "Post story 'Yang bisa tebak umur aku dapet hadiah'",
    "Ganti nama jadi 'AnakBaik' selama 2 jam",
    "Record suara kamu teriak 'Aku jomblo!' terus kirim",
    "Tiruin gaya bicara YouTuber favorit kamu 1 menit",
    "Chat orang bilang 'Aku baru bangun, kamu udah mimpi aku'",
    "Post quotes galau di medsos tanpa konteks",
    "Tulis 10 keburukan kamu terus kirim ke sini",
    "Bilang ke orang random 'Kamu mirip mantan aku'",
    "Foto kaki kamu terus kirim ke sini",
    "Tahan tawa selama 1 menit sambil liat meme",
    "Baca chat ini dengan aksen Jawa medok",
    "Tiruin gaya foto model iklan sampo",
    "Chat orang bilang 'Aku baru belajar nge-flirt, boleh latihan?'",
    "Post screenshot chat ini ke story medsos",
    "Bilang ke orang terdekat 'Aku sayang kamu' dengan serius",
    "Tiruin suara mesin tik di voice chat 30 detik",
    "Upload foto pas kamu masih berantakan bangun tidur",
    "Tulis review fake produk random di e-commerce",
    "Chat orang bilang 'Aku bisa baca pikiran kamu loh'",
    "Post status 'Butuh motivasi, DM aku ya'"
    ];
        
        // Random pilih truth atau dare
        const isTruth = Math.random() < 0.5;
        const challenge = isTruth ? 
            truths[Math.floor(Math.random() * truths.length)] : 
            dares[Math.floor(Math.random() * dares.length)];
        
        // Reward koin buat yang berani main td
        const reward = Math.floor(Math.random() * 100) + 50; // 50-150 koin
        userData.saldo += reward;
        
        // Update statistik
        userData.statistik.tod_terakhir = now;
        userData.statistik.command_digunakan++;
        
        // Update statistik server
        client.database.statistik_game.tod_dimainkan = (client.database.statistik_game.tod_dimainkan || 0) + 1;
        
        // Simpan database
        client.db.save(client.database);
        
        // Bikin embed yang aesthetic td
        const embed = new EmbedBuilder()
            .setColor(isTruth ? '#FF6B6B' : '#4ECDC4')
            .setTitle(isTruth ? '🔍 TRUTH TIME TD!' : '🎯 DARE CHALLENGE TD!')
            .setDescription(`**${message.author.username}** dapet ${isTruth ? 'Truth' : 'Dare'} nih td!\n\n**${challenge}**`)
            .addFields(
                { name: '💰 Reward', value: `+${reward} koin buat keberanian lo td!`, inline: true },
                { name: '💳 Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: 'Berani ga lo lakuin td? 😏' })
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};