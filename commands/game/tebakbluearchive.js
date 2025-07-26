const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tebakbluearchive',
    description: 'Tebak karakter Blue Archive berdasarkan petunjuk',
    aliases: ['guessba', 'tebakba'],
    cooldown: 5,
    execute(message, args, client) {
        const characters = [
    { name: "Hoshino", clue: "Siswa malas dari Abydos dengan senjata besar", school: "Abydos High School" },
    { name: "Aru", clue: "Pemimpin Problem Solver 68 yang ingin jadi penjahat", school: "Gehenna Academy" },
    { name: "Shiroko", clue: "Siswa misterius dari Abydos yang suka bersepeda", school: "Abydos High School" },
    { name: "Hina", clue: "Ketua OSIS Gehenna yang ditakuti", school: "Gehenna Academy" },
    { name: "Iori", clue: "Siswa berambut merah dari Trinity yang ahli strategi", school: "Trinity General School" },
    { name: "Haruna", clue: "Siswa eksentrik dari Gehenna yang suka makan", school: "Gehenna Academy" },
    { name: "Koharu", clue: "Siswa pemalu dari Trinity yang suka membaca", school: "Trinity General School" },
    { name: "Azusa", clue: "Sniper pendiam dari Trinity", school: "Trinity General School" },
    { name: "Yuka", clue: "Paha 100kg yang sangat kuat dan bertenaga", school: "Millennium Science School" },
    { name: "Yuzu", clue: "Mekanik jenius dari Millennium yang suka robot", school: "Millennium Science School" },
    { name: "Momoi", clue: "Kembar dari Millennium yang ahli teknologi", school: "Millennium Science School" },
    { name: "Midori", clue: "Kembar dari Millennium yang lebih pendiam", school: "Millennium Science School" },
    { name: "Arisu", clue: "Siswa genius dari Millennium dengan kepribadian tsundere", school: "Millennium Science School" },
    { name: "Mutsuki", clue: "Siswa nakal dari Gehenna yang suka ledakan", school: "Gehenna Academy" },
    { name: "Kayoko", clue: "Delinquent dari Gehenna dengan jiwa bebas", school: "Gehenna Academy" },
    { name: "Akane", clue: "Siswa rajin dari Gehenna yang perfeksionis", school: "Gehenna Academy" },
    { name: "Serika", clue: "Perawat dari Trinity yang baik hati", school: "Trinity General School" },
    { name: "Nonomi", clue: "Siswa ceria dari Abydos yang suka membantu", school: "Abydos High School" },
    { name: "Ayane", clue: "Siswa pintar dari Abydos yang ahli komputer", school: "Abydos High School" },
    { name: "Tsurugi", clue: "Anggota Justice Task Force Trinity yang teguh", school: "Trinity General School" },
    { name: "Hasumi", clue: "Ketua Justice Task Force yang adil", school: "Trinity General School" },
    { name: "Mashiro", clue: "Siswa polos dari Abydos yang suka fotografi", school: "Abydos High School" },
    { name: "Izumi", clue: "Siswa atletis dari Trinity yang energik", school: "Trinity General School" },
    { name: "Chise", clue: "Siswa pendiam dari Trinity yang suka seni", school: "Trinity General School" },
    { name: "Noa", clue: "Siswa kaya dari Millennium yang sombong", school: "Millennium Science School" },
    { name: "Karin", clue: "Siswa populer dari Millennium yang percaya diri", school: "Millennium Science School" },
    { name: "Asuna", clue: "Siswa atletis dari Millennium yang kompetitif", school: "Millennium Science School" },
    { name: "Akari", clue: "Siswa pemalu dari Gehenna yang suka memasak", school: "Gehenna Academy" },
    { name: "Junko", clue: "Anggota Problem Solver 68 yang loyal", school: "Gehenna Academy" },
    { name: "Makoto", clue: "Siswa serius dari Trinity yang bertanggung jawab", school: "Trinity General School" },
    { name: "Ibuki", clue: "Siswa pemberani dari Trinity yang suka tantangan", school: "Trinity General School" },
    { name: "Shun", clue: "Siswa pendiam dari Shanhaijing yang misterius", school: "Shanhaijing Senior Secondary School" },
    { name: "Sumire", clue: "Siswa elegan dari Trinity yang sopan", school: "Trinity General School" },
    { name: "Chinatsu", clue: "Siswa cerdas dari Gehenna yang analitis", school: "Gehenna Academy" },
    { name: "Hanae", clue: "Siswa rajin dari Millennium yang tekun", school: "Millennium Science School" },
    { name: "Kotama", clue: "Siswa penyendiri dari Trinity yang suka buku", school: "Trinity General School" },
    { name: "Ui", clue: "Siswa manis dari Trinity yang innocent", school: "Trinity General School" },
    { name: "Nodoka", clue: "Siswa tenang dari Trinity yang bijaksana", school: "Trinity General School" },
    { name: "Shizuko", clue: "Siswa dari Shanhaijing yang tradisional", school: "Shanhaijing Senior Secondary School" },
    { name: "Toki", clue: "Siswa dari Shanhaijing yang spiritual", school: "Shanhaijing Senior Secondary School" },
    { name: "Cherino", clue: "Siswa kecil dari Trinity yang imut", school: "Trinity General School" },
    { name: "Marina", clue: "Siswa dari Red Winter yang tangguh", school: "Red Winter Federal Academy" },
    { name: "Nodoka", clue: "Siswa tenang yang suka kedamaian", school: "Trinity General School" },
    { name: "Satsuki", clue: "Siswa dari Red Winter yang disiplin", school: "Red Winter Federal Academy" },
    { name: "Cherino", clue: "Siswa muda Trinity yang energik", school: "Trinity General School" },
    { name: "Natsu", clue: "Siswa musim panas yang ceria", school: "Trinity General School" },
    { name: "Ako", clue: "Siswa dari Gehenna yang bandel", school: "Gehenna Academy" },
    { name: "Himari", clue: "Siswa dari Gehenna yang manja", school: "Gehenna Academy" },
    { name: "Ichika", clue: "Siswa dari Millennium yang teknis", school: "Millennium Science School" },
    { name: "Kirino", clue: "Siswa dari Millennium yang sistematis", school: "Millennium Science School" },
    { name: "Misaki", clue: "Siswa dari Trinity yang lemah lembut", school: "Trinity General School" },
    { name: "Reisa", clue: "Siswa dari Gehenna yang cool", school: "Gehenna Academy" },
    { name: "Wakamo", clue: "Siswa dari Hyakkiyako yang unik", school: "Hyakkiyako Alliance Academy" },
    { name: "Izuna", clue: "Ninja kecil dari Hyakkiyako yang lincah", school: "Hyakkiyako Alliance Academy" },
    { name: "Tsukuyo", clue: "Siswa dari Hyakkiyako yang tradisional", school: "Hyakkiyako Alliance Academy" },
    { name: "Mika", clue: "Ketua Trinity yang karismatik", school: "Trinity General School" },
    { name: "Nagisa", clue: "Siswa dari Hyakkiyako yang tenang", school: "Hyakkiyako Alliance Academy" },
    { name: "Saori", clue: "Siswa kaya dari Trinity yang anggun", school: "Trinity General School" }
];

        const randomChar = characters[Math.floor(Math.random() * characters.length)];
        const filter = m => m.author.id === message.author.id;
        
        const embed = new EmbedBuilder()
            .setTitle('Tebak Karakter Blue Archive')
            .setDescription(`**Petunjuk:** ${randomChar.clue}\n**Sekolah:** ${randomChar.school}\nSiapa nama karakter ini? Kamu punya 20 detik!`)
            .setColor('#4A90E2')
            .setThumbnail('https://example.com/bluearchive-logo.png'); // Ganti dengan URL gambar logo Blue Archive
        
        message.reply({ embeds: [embed] });

        message.channel.awaitMessages({ filter, max: 1, time: 20000, errors: ['time'] })
            .then(collected => {
                if (collected.first().content.toLowerCase() === randomChar.name.toLowerCase()) {
                    const reward = 500 + Math.floor(Math.random() * 401);
                    client.database.users[message.author.id].saldo += reward;
                    client.db.save(client.database);
                    message.reply(`🎉 **Benar!** Karakter ini adalah **${randomChar.name}**. Kamu mendapatkan **${reward}** koin!`);
                } else {
                    message.reply(`❌ **Salah!** Karakter yang benar adalah **${randomChar.name}**.`);
                }
            })
            .catch(() => message.reply('⏰ **Waktu habis!** Jawab lebih cepat lain kali!'));
    }
};