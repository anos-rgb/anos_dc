const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'family100',
    description: 'Game Family 100 dengan pertanyaan random - semua orang bisa ikut!',
    aliases: ['f100', 'family'],
    cooldown: 10,
    execute(message, args, client) {
        const questions = [
            // Pertanyaan Umum & Mudah
            {
                question: "Sebutkan makanan yang biasa dimakan saat sarapan!",
                answers: ["nasi uduk", "roti", "bubur", "lontong", "ketupat", "nasi goreng", "mie ayam", "gado-gado", "soto", "bakso"],
                points: 30
            },
            {
                question: "Sebutkan minuman yang sering diminum sehari-hari!",
                answers: ["air putih", "teh", "kopi", "susu", "jus", "sirup", "es teh", "air mineral", "soft drink", "yogurt"],
                points: 25
            },
            {
                question: "Sebutkan alat tulis yang ada di sekolah!",
                answers: ["pensil", "pulpen", "spidol", "penghapus", "penggaris", "krayon", "stabilo", "tip-ex", "stapler", "gunting"],
                points: 20
            },
            {
                question: "Sebutkan bagian tubuh manusia!",
                answers: ["kepala", "tangan", "kaki", "mata", "hidung", "mulut", "telinga", "dada", "perut", "punggung"],
                points: 15
            },
            {
                question: "Sebutkan kendaraan roda dua!",
                answers: ["motor", "sepeda", "vespa", "bebek", "matic", "sport", "trail", "onthel", "bmx", "fixie"],
                points: 30
            },
            {
                question: "Sebutkan peralatan dapur!",
                answers: ["panci", "wajan", "sendok", "garpu", "pisau", "spatula", "piring", "mangkok", "gelas", "kompor"],
                points: 25
            },
            {
                question: "Sebutkan buah-buahan tropis!",
                answers: ["mangga", "pisang", "jeruk", "apel", "pepaya", "nanas", "durian", "rambutan", "manggis", "salak"],
                points: 20
            },
            {
                question: "Sebutkan hewan peliharaan!",
                answers: ["kucing", "anjing", "burung", "hamster", "kelinci", "ikan", "kura-kura", "ayam", "marmut", "iguana"],
                points: 25
            },
            {
                question: "Sebutkan profesi yang ada di rumah sakit!",
                answers: ["dokter", "perawat", "bidan", "apoteker", "radiologi", "ahli gizi", "fisioterapi", "laboratorium", "security", "cleaning service"],
                points: 35
            },
            {
                question: "Sebutkan mata pelajaran di sekolah dasar!",
                answers: ["matematika", "bahasa indonesia", "ipa", "ips", "bahasa inggris", "agama", "pkn", "olahraga", "seni budaya", "prakarya"],
                points: 20
            },
            {
                question: "Sebutkan tempat wisata yang ada di Indonesia!",
                answers: ["bali", "yogyakarta", "borobudur", "taman mini", "ancol", "bandung", "lombok", "raja ampat", "bunaken", "bromo"],
                points: 40
            },
            {
                question: "Sebutkan makanan khas betawi!",
                answers: ["kerak telor", "soto betawi", "asinan betawi", "nasi uduk", "gado-gado", "ketoprak", "tauge goreng", "bir pletok", "dodol betawi", "roti buaya"],
                points: 45
            },
            {
                question: "Sebutkan cara untuk menjaga kesehatan!",
                answers: ["olahraga", "makan sehat", "tidur cukup", "minum air", "cuci tangan", "tidak merokok", "istirahat", "cek kesehatan", "hindari stress", "jaga pola makan"],
                points: 30
            },
            {
                question: "Sebutkan jenis musik populer!",
                answers: ["pop", "rock", "jazz", "dangdut", "reggae", "blues", "country", "r&b", "hip hop", "electronic"],
                points: 35
            },
            {
                question: "Sebutkan aplikasi chatting!",
                answers: ["whatsapp", "telegram", "line", "discord", "skype", "messenger", "wechat", "viber", "signal", "threema"],
                points: 30
            },
            {
                question: "Sebutkan olahraga yang menggunakan bola!",
                answers: ["sepak bola", "basket", "voli", "tenis", "badminton", "ping pong", "bowling", "golf", "baseball", "rugby"],
                points: 25
            },
            {
                question: "Sebutkan pekerjaan yang berhubungan dengan makanan!",
                answers: ["koki", "chef", "baker", "pelayan", "kasir", "barista", "food blogger", "ahli gizi", "penjual", "distributor"],
                points: 35
            },
            {
                question: "Sebutkan benda yang ada di kamar tidur!",
                answers: ["tempat tidur", "bantal", "kasur", "lemari", "meja", "kursi", "lampu", "ac", "kipas", "cermin"],
                points: 20
            },
            {
                question: "Sebutkan jenis transportasi umum!",
                answers: ["bus", "kereta", "angkot", "ojek", "taxi", "grab", "gojek", "becak", "bajaj", "metro"],
                points: 30
            },
            {
                question: "Sebutkan makanan yang digoreng!",
                answers: ["pisang goreng", "tempe goreng", "tahu goreng", "bakwan", "mendoan", "singkong goreng", "ubi goreng", "keripik", "rempeyek", "risoles"],
                points: 25
            },
            {
                question: "Sebutkan brand smartphone terkenal!",
                answers: ["samsung", "iphone", "oppo", "vivo", "xiaomi", "realme", "huawei", "nokia", "infinix", "poco"],
                points: 30
            },
            {
                question: "Sebutkan cuaca atau kondisi langit!",
                answers: ["cerah", "mendung", "hujan", "berawan", "panas", "dingin", "gerimis", "badai", "kabut", "berangin"],
                points: 20
            },
            {
                question: "Sebutkan permainan tradisional Indonesia!",
                answers: ["congklak", "petak umpet", "gobak sodor", "kelereng", "layangan", "egrang", "lompat tali", "bekel", "gundu", "benteng"],
                points: 40
            },
            {
                question: "Sebutkan bahan makanan pokok!",
                answers: ["beras", "jagung", "singkong", "ubi", "kentang", "sagu", "terigu", "gandum", "talas", "gembili"],
                points: 25
            },
            {
                question: "Sebutkan alat elektronik di rumah!",
                answers: ["tv", "kulkas", "ac", "kipas", "rice cooker", "microwave", "blender", "mixer", "setrika", "vacuum"],
                points: 30
            },
            {
                question: "Sebutkan jenis kain atau bahan pakaian!",
                answers: ["katun", "sutra", "polyester", "denim", "linen", "wool", "rayon", "spandex", "lycra", "jersey"],
                points: 35
            },
            {
                question: "Sebutkan makanan manis atau dessert!",
                answers: ["es krim", "kue", "puding", "coklat", "permen", "donat", "cake", "pie", "tart", "cookies"],
                points: 25
            },
            {
                question: "Sebutkan tempat belanja!",
                answers: ["mall", "pasar", "supermarket", "warung", "toko", "minimarket", "plaza", "department store", "outlet", "pasar malam"],
                points: 20
            },
            {
                question: "Sebutkan jenis ikan yang bisa dimakan!",
                answers: ["lele", "mujair", "gurame", "nila", "patin", "salmon", "tuna", "tongkol", "bandeng", "kakap"],
                points: 30
            },
            {
                question: "Sebutkan peralatan mandi!",
                answers: ["sabun", "sampo", "sikat gigi", "pasta gigi", "handuk", "gayung", "shower", "spons", "lotion", "kondisioner"],
                points: 25
            },
            {
                question: "Sebutkan jenis sayuran hijau!",
                answers: ["bayam", "kangkung", "sawi", "selada", "brokoli", "kubis", "pakcoy", "kemangi", "daun bawang", "seledri"],
                points: 25
            },
            {
                question: "Sebutkan alat musik tradisional Indonesia!",
                answers: ["gamelan", "angklung", "sasando", "tifa", "kendang", "suling", "kecapi", "rebana", "kolintang", "gong"],
                points: 50
            },
            {
                question: "Sebutkan jenis roti!",
                answers: ["roti tawar", "roti bakar", "roti sobek", "croissant", "bagel", "donat", "muffin", "baguette", "roti gandum", "roti manis"],
                points: 30
            },
            {
                question: "Sebutkan tempat ibadah!",
                answers: ["masjid", "gereja", "pura", "vihara", "klenteng", "musholla", "langgar", "kapel", "katedral", "kuil"],
                points: 25
            },
            {
                question: "Sebutkan makanan berkuah!",
                answers: ["soto", "bakso", "sup", "rawon", "gulai", "sayur asem", "sop", "tongseng", "rendang", "opor"],
                points: 30
            },
            {
                question: "Sebutkan jenis sepatu!",
                answers: ["sneakers", "sandal", "high heels", "boots", "flat shoes", "slip on", "loafers", "wedges", "crocs", "oxford"],
                points: 30
            },
            {
                question: "Sebutkan peralatan sekolah!",
                answers: ["tas", "buku", "pensil", "penggaris", "penghapus", "spidol", "crayon", "map", "stapler", "lem"],
                points: 20
            },
            {
                question: "Sebutkan makanan yang dipanggang!",
                answers: ["roti bakar", "ayam bakar", "jagung bakar", "ikan bakar", "sate", "martabak", "pizza", "kebab", "barbeque", "kue"],
                points: 30
            },
            {
                question: "Sebutkan jenis kopi!",
                answers: ["espresso", "cappuccino", "latte", "americano", "macchiato", "mocha", "kopi tubruk", "kopi susu", "cold brew", "affogato"],
                points: 35
            },
            {
                question: "Sebutkan tempat rekreasi keluarga!",
                answers: ["taman", "pantai", "gunung", "museum", "kebun binatang", "waterpark", "mall", "bioskop", "cafe", "restoran"],
                points: 25
            },
            {
                question: "Sebutkan jenis pasta!",
                answers: ["spaghetti", "macaroni", "fettuccine", "penne", "lasagna", "ravioli", "linguine", "fusilli", "farfalle", "rigatoni"],
                points: 40
            },
            {
                question: "Sebutkan peralatan berkebun!",
                answers: ["cangkul", "sekop", "sabit", "gunting", "selang", "pot", "pupuk", "bibit", "sprayer", "ember"],
                points: 35
            },
            {
                question: "Sebutkan jenis es krim!",
                answers: ["vanilla", "coklat", "strawberry", "cookies cream", "mint", "caramel", "coconut", "mango", "taro", "durian"],
                points: 25
            },
            {
                question: "Sebutkan mata uang negara!",
                answers: ["rupiah", "dollar", "euro", "yen", "won", "ringgit", "pound", "yuan", "baht", "peso"],
                points: 40
            },
            {
                question: "Sebutkan jenis burung!",
                answers: ["merpati", "gagak", "ayam", "bebek", "angsa", "burung hantu", "elang", "kakak tua", "kenari", "lovebird"],
                points: 30
            },
            {
                question: "Sebutkan peralatan fotografi!",
                answers: ["kamera", "lensa", "tripod", "flash", "memory card", "battery", "charger", "tas kamera", "filter", "remote"],
                points: 45
            },
            {
                question: "Sebutkan jenis dance atau tarian!",
                answers: ["saman", "kecak", "jaipong", "tor tor", "legong", "pendet", "gambyong", "piring", "poco-poco", "salsa"],
                points: 40
            },
            {
                question: "Sebutkan makanan ringan atau snack!",
                answers: ["keripik", "biskuit", "crackers", "popcorn", "kacang", "coklat", "permen", "wafer", "pretzel", "nuts"],
                points: 25
            },
            {
                question: "Sebutkan tempat belajar!",
                answers: ["sekolah", "universitas", "perpustakaan", "kursus", "les", "akademi", "institut", "pondok", "madrasah", "laboratorium"],
                points: 30
            },
            {
                question: "Sebutkan jenis mobil!",
                answers: ["sedan", "suv", "hatchback", "mpv", "pickup", "convertible", "coupe", "wagon", "crossover", "jeep"],
                points: 35
            },
            {
                question: "Sebutkan peralatan olahraga!",
                answers: ["bola", "raket", "sepatu", "jersey", "helm", "sarung tangan", "matras", "dumbbell", "barbel", "treadmill"],
                points: 30
            },
            {
                question: "Sebutkan jenis teh!",
                answers: ["teh hitam", "teh hijau", "teh oolong", "teh putih", "teh melati", "teh earl grey", "teh chamomile", "teh peppermint", "teh ginger", "teh lemon"],
                points: 35
            },
            {
                question: "Sebutkan alat komunikasi!",
                answers: ["hp", "telepon", "radio", "walkie talkie", "email", "surat", "fax", "telegram", "intercom", "satelit"],
                points: 30
            },
            {
                question: "Sebutkan jenis game mobile!",
                answers: ["mobile legends", "pubg", "free fire", "among us", "minecraft", "clash of clans", "candy crush", "subway surfers", "temple run", "plants vs zombies"],
                points: 35
            },
            {
                question: "Sebutkan tempat penyimpanan!",
                answers: ["lemari", "laci", "kotak", "tas", "rak", "brankas", "gudang", "loker", "container", "storage"],
                points: 25
            },
            {
                question: "Sebutkan jenis keju!",
                answers: ["cheddar", "mozzarella", "parmesan", "swiss", "gouda", "blue cheese", "feta", "cream cheese", "brie", "camembert"],
                points: 40
            },
            {
                question: "Sebutkan peralatan make up!",
                answers: ["lipstik", "bedak", "mascara", "eyeliner", "blush on", "foundation", "concealer", "eyeshadow", "primer", "bronzer"],
                points: 35
            },
            {
                question: "Sebutkan jenis pizza!",
                answers: ["margherita", "pepperoni", "hawaiian", "meat lovers", "vegetarian", "supreme", "quattro stagioni", "marinara", "capricciosa", "americana"],
                points: 35
            },
            {
                question: "Sebutkan alat pertukangan!",
                answers: ["palu", "obeng", "tang", "gergaji", "bor", "meteran", "level", "kunci", "pahat", "kikir"],
                points: 30
            },
            {
                question: "Sebutkan jenis susu!",
                answers: ["susu sapi", "susu kambing", "susu almond", "susu kedelai", "susu oat", "susu kelapa", "susu rice", "susu evaporated", "susu condensed", "susu bubuk"],
                points: 30
            },
            {
                question: "Sebutkan peralatan cleaning atau kebersihan!",
                answers: ["sapu", "pel", "vacuum", "lap", "detergen", "sabun", "sikat", "kain", "ember", "spray"],
                points: 25
            },
            {
                question: "Sebutkan jenis jeruk!",
                answers: ["jeruk manis", "jeruk nipis", "jeruk bali", "jeruk lemon", "jeruk mandarin", "jeruk sunkist", "jeruk purut", "jeruk valencia", "jeruk keprok", "jeruk baby"],
                points: 30
            },
            {
                question: "Sebutkan tempat berbelanja online!",
                answers: ["shopee", "tokopedia", "lazada", "bukalapak", "blibli", "zalora", "jd.id", "orami", "sociolla", "amazon"],
                points: 30
            },
            {
                question: "Sebutkan jenis coklat!",
                answers: ["dark chocolate", "milk chocolate", "white chocolate", "bitter chocolate", "ruby chocolate", "cocoa powder", "hot chocolate", "chocolate chip", "truffle", "praline"],
                points: 35
            },
            {
                question: "Sebutkan peralatan camping!",
                answers: ["tenda", "sleeping bag", "kompor portable", "senter", "tas gunung", "matras", "pisau", "tali", "carabiner", "headlamp"],
                points: 45
            },
            {
                question: "Sebutkan jenis nasi!",
                answers: ["nasi putih", "nasi merah", "nasi ketan", "nasi basmati", "nasi jasmine", "nasi shirataki", "nasi organik", "beras hitam", "nasi brown", "nasi jagung"],
                points: 30
            },
            {
                question: "Sebutkan media sosial untuk berbagi foto!",
                answers: ["instagram", "facebook", "twitter", "pinterest", "snapchat", "flickr", "tumblr", "500px", "vsco", "photobucket"],
                points: 30
            },
            {
                question: "Sebutkan jenis mainan anak!",
                answers: ["boneka", "mobil-mobilan", "lego", "puzzle", "bola", "robot", "pesawat", "barbie", "uno", "monopoly"],
                points: 25
            },
            {
                question: "Sebutkan peralatan kantor!",
                answers: ["komputer", "printer", "scanner", "telepon", "meja", "kursi", "lemari arsip", "stapler", "paper clip", "penjepit"],
                points: 30
            },
            {
                question: "Sebutkan jenis sambal!",
                answers: ["sambal terasi", "sambal ijo", "sambal matah", "sambal bawang", "sambal tomat", "sambal kecap", "sambal rujak", "sambal pecel", "sambal dadak", "sambal oelek"],
                points: 35
            }
        ];
        
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        const gameParticipants = new Set(); // Track siapa saja yang sudah menjawab
        const correctAnswerers = []; // Track yang jawab benar
        
        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🎪 Family 100 - Multiplayer')
            .setDescription(`**${randomQuestion.question}**`)
            .addFields(
                { name: '⏰ Waktu', value: '30 detik', inline: true },
                { name: '💰 Poin', value: `${randomQuestion.points} poin`, inline: true },
                { name: '👥 Mode', value: 'Semua bisa ikut!', inline: true }
            )
            .setFooter({ text: 'Siapa cepat dia dapat! Ketik jawabanmu sekarang!' });
        
        message.reply({ embeds: [embed] });
        
        // Filter yang memungkinkan semua user di channel untuk menjawab
        const filter = (response) => {
            return response.channel.id === message.channel.id && 
                   !response.author.bot && 
                   !gameParticipants.has(response.author.id); // Setiap user hanya bisa jawab sekali
        };
        
        const collector = message.channel.createMessageCollector({
            filter,
            time: 30000, // 30 detik
            max: 20 // Maksimal 20 jawaban untuk mencegah spam
        });
        
        collector.on('collect', (collected) => {
            const userAnswer = collected.content.toLowerCase().trim();
            const userId = collected.author.id;
            const userName = collected.author.username;
            
            // Tambahkan user ke participants agar tidak bisa jawab lagi
            gameParticipants.add(userId);
            
            const correctAnswers = randomQuestion.answers.filter(answer => 
                answer.toLowerCase().includes(userAnswer) || userAnswer.includes(answer.toLowerCase())
            );
            
            if (correctAnswers.length > 0) {
                // Pastikan user data exists
                if (!client.database.users[userId]) {
                    client.database.users[userId] = {
                        saldo: 0,
                        statistik: { command_digunakan: 0 }
                    };
                }
                
                const userData = client.database.users[userId];
                userData.saldo += randomQuestion.points;
                userData.statistik.command_digunakan++;
                client.db.save(client.database);
                
                correctAnswerers.push({
                    user: userName,
                    answer: userAnswer,
                    points: randomQuestion.points
                });
                
                // React dengan checkmark
                collected.react('✅');
                
                const successEmbed = new EmbedBuilder()
                    .setColor('#55FF55')
                    .setTitle('🎉 Benar!')
                    .setDescription(`**${userName}** menjawab "${userAnswer}" dengan benar!`)
                    .addFields(
                        { name: '💰 Poin Didapat', value: `+${randomQuestion.points} poin`, inline: true },
                        { name: '💳 Saldo Baru', value: `${userData.saldo} koin`, inline: true }
                    );
                
                message.channel.send({ embeds: [successEmbed] });
            } else {
                // React dengan X mark
                collected.react('❌');
            }
        });
        
        collector.on('end', (collected) => {
            let resultEmbed;
            
            if (correctAnswerers.length > 0) {
                // Ada yang menjawab benar
                const leaderboard = correctAnswerers
                    .map((player, index) => `${index + 1}. **${player.user}** - "${player.answer}" (+${player.points} poin)`)
                    .join('\n');
                
                resultEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🏆 Game Selesai!')
                    .setDescription('**Pemenang Family 100:**\n' + leaderboard)
                    .addFields({
                        name: '📝 Beberapa Jawaban yang Benar',
                        value: randomQuestion.answers.slice(0, 5).join(', ') + (randomQuestion.answers.length > 5 ? '...' : ''),
                        inline: false
                    })
                    .setFooter({ text: `Total peserta: ${gameParticipants.size} orang` });
            } else {
                // Tidak ada yang menjawab benar
                resultEmbed = new EmbedBuilder()
                    .setColor('#FF5555')
                    .setTitle('😅 Game Selesai!')
                    .setDescription('Tidak ada yang menjawab dengan benar!')
                    .addFields({
                        name: '📝 Jawaban yang Benar',
                        value: randomQuestion.answers.slice(0, 8).join(', ') + (randomQuestion.answers.length > 8 ? '...' : ''),
                        inline: false
                    })
                    .setFooter({ text: `Total peserta: ${gameParticipants.size} orang` });
            }
            
            message.channel.send({ embeds: [resultEmbed] });
        });
    }
};