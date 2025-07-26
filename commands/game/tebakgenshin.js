const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tebakgenshin',
    description: 'Tebak karakter Genshin Impact berdasarkan petunjuk',
    aliases: ['guessgenshin', 'tebakchar'],
    cooldown: 5,
    execute(message, args, client) {
        const characters = [
    { name: "Hu Tao", clue: "Direktur rumah duka Wangsheng, pengguna Pyro", region: "Liyue" },
    { name: "Furina", clue: "Archon Hydro yang flamboyan", region: "Fontaine" },
    { name: "Raiden Shogun", clue: "Pemerintah Inazuma dan Archon Electro", region: "Inazuma" },
    { name: "Zhongli", clue: "Archon Geo yang ahli sejarah", region: "Liyue" },
    { name: "Nahida", clue: "Archon Dendro yang bijaksana", region: "Sumeru" },
    { name: "Xiao", clue: "Yaksha yang menggunakan polearm", region: "Liyue" },
    { name: "Ganyu", clue: "Sekretaris Qixing dengan darah Adeptus", region: "Liyue" },
    { name: "Kazuha", clue: "Samurai pengembara dari Inazuma", region: "Inazuma" },
    { name: "Yuka", clue: "Paha 100kg yang sangat kuat dan bertenaga", region: "Liyue" },
    { name: "Venti", clue: "Archon Anemo yang menyamar sebagai bard", region: "Mondstadt" },
    { name: "Diluc", clue: "Pemilik Dawn Winery, master Pyro", region: "Mondstadt" },
    { name: "Keqing", clue: "Liyue Qixing dengan kemampuan Electro", region: "Liyue" },
    { name: "Mona", clue: "Astrolog yang selalu kehabisan Mora", region: "Mondstadt" },
    { name: "Childe", clue: "Fatui Harbinger ke-11 yang suka bertarung", region: "Snezhnaya" },
    { name: "Albedo", clue: "Alchemist dari Mondstadt yang misterius", region: "Mondstadt" },
    { name: "Jean", clue: "Acting Grand Master Knights of Favonius", region: "Mondstadt" },
    { name: "Klee", clue: "Spark Knight yang suka meledakkan ikan", region: "Mondstadt" },
    { name: "Qiqi", clue: "Zombie kecil yang bekerja di apotek", region: "Liyue" },
    { name: "Ayaka", clue: "Putri klan Kamisato yang elegan", region: "Inazuma" },
    { name: "Ayato", clue: "Kepala klan Kamisato yang cerdik", region: "Inazuma" },
    { name: "Yae Miko", clue: "Guuji kuil Narukami yang licik", region: "Inazuma" },
    { name: "Itto", clue: "Oni yang bersuara keras dan suka beetle", region: "Inazuma" },
    { name: "Kokomi", clue: "Divine Priestess Sangonomiya", region: "Inazuma" },
    { name: "Gorou", clue: "General Sangonomiya yang setia", region: "Inazuma" },
    { name: "Thoma", clue: "Housekeeper klan Kamisato", region: "Inazuma" },
    { name: "Sayu", clue: "Ninja kecil yang suka tidur", region: "Inazuma" },
    { name: "Yoimiya", clue: "Pembuat kembang api Naganohara", region: "Inazuma" },
    { name: "Heizou", clue: "Detektif Tenryou Commission", region: "Inazuma" },
    { name: "Tighnari", clue: "Forest Ranger ahli botani", region: "Sumeru" },
    { name: "Collei", clue: "Trainee Forest Ranger yang pemalu", region: "Sumeru" },
    { name: "Dori", clue: "Merchant kaya dari Sumeru", region: "Sumeru" },
    { name: "Cyno", clue: "General Mahamatra yang serius", region: "Sumeru" },
    { name: "Candace", clue: "Guardian Aaru Village", region: "Sumeru" },
    { name: "Nilou", clue: "Penari Zubayr Theater", region: "Sumeru" },
    { name: "Wanderer", clue: "Puppet yang mencari identitasnya", region: "Sumeru" },
    { name: "Faruzan", clue: "Scholar ancient mechanisms", region: "Sumeru" },
    { name: "Alhaitham", clue: "Acting Grand Sage yang pragmatis", region: "Sumeru" },
    { name: "Yaoyao", clue: "Adeptus disciple yang ceria", region: "Liyue" },
    { name: "Baizhu", clue: "Pemilik Bubu Pharmacy", region: "Liyue" },
    { name: "Kaveh", clue: "Architect perfeksionis dari Sumeru", region: "Sumeru" },
    { name: "Kirara", clue: "Kurir nekomata dari Inazuma", region: "Inazuma" },
    { name: "Lyney", clue: "Magician terkenal dari Fontaine", region: "Fontaine" },
    { name: "Lynette", clue: "Asisten magician yang tenang", region: "Fontaine" },
    { name: "Freminet", clue: "Penyelam yang pemalu", region: "Fontaine" },
    { name: "Neuvillette", clue: "Chief Justice Fontaine", region: "Fontaine" },
    { name: "Wriothesley", clue: "Administrator Fortress of Meropide", region: "Fontaine" },
    { name: "Charlotte", clue: "Reporter The Steambird", region: "Fontaine" },
    { name: "Xianyun", clue: "Adeptus yang suka teknologi", region: "Liyue" },
    { name: "Gaming", clue: "Wushou dancer yang energik", region: "Liyue" },
    { name: "Chiori", clue: "Fashion designer dari Inazuma", region: "Inazuma" },
    { name: "Arlecchino", clue: "The Knave, Fatui Harbinger ke-4", region: "Snezhnaya" },
    { name: "Sethos", clue: "Temple of Silence member", region: "Sumeru" },
    { name: "Clorinde", clue: "Champion Duelist Fontaine", region: "Fontaine" },
    { name: "Sigewinne", clue: "Head Nurse Fortress of Meropide", region: "Fontaine" },
    { name: "Emilie", clue: "Perfumer dari Fontaine", region: "Fontaine" },
    { name: "Kinich", clue: "Saurian Hunter dari Natlan", region: "Natlan" },
    { name: "Mualani", clue: "Guide pantai dari Natlan", region: "Natlan" },
    { name: "Kachina", clue: "Penambang muda dari Natlan", region: "Natlan" },
    { name: "Xilonen", clue: "Name Engraver dari Natlan", region: "Natlan" },
    { name: "Chasca", clue: "Peacekeeper dari Natlan", region: "Natlan" },
    { name: "Ororon", clue: "Young shaman dari Natlan", region: "Natlan" },
    { name: "Mavuika", clue: "Archon Pyro yang memimpin Natlan", region: "Natlan" },
    { name: "Citlali", clue: "Ancient shaman dari Natlan", region: "Natlan" },
    { name: "Lan Yan", clue: "Anemo fighter dari Liyue", region: "Liyue" }
];

        const randomChar = characters[Math.floor(Math.random() * characters.length)];
        const filter = m => m.author.id === message.author.id;
        
        const embed = new EmbedBuilder()
            .setTitle('Tebak Karakter Genshin Impact')
            .setDescription(`**Petunjuk:** ${randomChar.clue}\n**Region:** ${randomChar.region}\nSiapa nama karakter ini? Kamu punya 20 detik!`)
            .setColor('#FFD700')
            .setThumbnail('https://example.com/genshin-logo.png'); // Ganti dengan URL gambar logo Genshin
        
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