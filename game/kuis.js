const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kuis',
    description: 'Jawab pertanyaan untuk mendapatkan koin',
    cooldown: 30,
    async execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        // Cek apakah user ada di database
        if (!userData) {
            return message.reply('Kamu belum terdaftar! Gunakan command `/daftar` terlebih dahulu.');
        }
        
        // Tentukan tingkat kesulitan dan hadiah
        let difficulty = 'mudah';
        let reward = 150;
        
        if (args[0]) {
            const difficultyArg = args[0].toLowerCase();
            
            if (difficultyArg === 'sedang') {
                difficulty = 'sedang';
                reward = 300;
            } else if (difficultyArg === 'sulit') {
                difficulty = 'sulit';
                reward = 600;
            }
        }
        
        // List pertanyaan berdasarkan tingkat kesulitan
        const questions = {
    mudah: [
        {
            question: "Apa nama perusahaan yang mengembangkan iPhone?",
            answer: "apple",
            options: ["samsung", "apple", "google", "xiaomi"]
        },
        {
            question: "Apa warna logo Facebook?",
            answer: "biru",
            options: ["merah", "hijau", "biru", "kuning"]
        },
        {
            question: "Apa nama asisten virtual Apple?",
            answer: "siri",
            options: ["alexa", "google assistant", "siri", "cortana"]
        },
        {
            question: "Apa nama sistem operasi komputer Apple?",
            answer: "macos",
            options: ["windows", "linux", "macos", "chrome os"]
        },
        {
            question: "Apa nama platform video pendik dari China yang populer?",
            answer: "tiktok",
            options: ["instagram", "tiktok", "youtube", "snapchat"]
        },
        {
            question: "Apa nama layanan streaming musik paling populer?",
            answer: "spotify",
            options: ["spotify", "apple music", "youtube music", "deezer"]
        },
        {
            question: "Apa nama perusahaan induk dari Google?",
            answer: "alphabet",
            options: ["meta", "alphabet", "microsoft", "amazon"]
        },
        {
            question: "Apa nama layanan cloud dari Microsoft?",
            answer: "azure",
            options: ["aws", "google cloud", "azure", "ibm cloud"]
        },
        {
            question: "Apa nama smartphone lipat dari Samsung?",
            answer: "galaxy z fold",
            options: ["galaxy s", "galaxy note", "galaxy z fold", "galaxy a"]
        },
        {
            question: "Apa nama AI chatbot dari OpenAI yang populer?",
            answer: "chatgpt",
            options: ["chatgpt", "bard", "claude", "llama"]
        },
        {
            question: "Apa nama sistem pembayaran digital dari PayPal?",
            answer: "venmo",
            options: ["venmo", "cash app", "zelle", "payoneer"]
        },
        {
            question: "Apa nama layanan berlangganan film dari Netflix?",
            answer: "netflix premium",
            options: ["netflix basic", "netflix standard", "netflix premium", "netflix family"]
        },
        {
            question: "Apa nama game mobile tentang menyusun puzzle warna?",
            answer: "candy crush",
            options: ["angry birds", "candy crush", "clash of clans", "pokemon go"]
        },
        {
            question: "Apa nama layanan email dari Google?",
            answer: "gmail",
            options: ["outlook", "yahoo mail", "gmail", "protonmail"]
        },
        {
            question: "Apa nama tablet dari Apple?",
            answer: "ipad",
            options: ["galaxy tab", "ipad", "surface", "kindle"]
        },
        {
            question: "Apa nama sistem operasi open source untuk smartphone?",
            answer: "android",
            options: ["ios", "android", "harmony os", "windows phone"]
        },
        {
            question: "Apa nama layanan streaming game dari Nvidia?",
            answer: "geforce now",
            options: ["xbox cloud", "geforce now", "playstation now", "stadia"]
        },
        {
            question: "Apa nama smartwatch dari Apple?",
            answer: "apple watch",
            options: ["galaxy watch", "apple watch", "fitbit", "xiaomi band"]
        },
        {
            question: "Apa nama virtual reality headset dari Meta?",
            answer: "oculus",
            options: ["oculus", "htc vive", "playstation vr", "valve index"]
        },
        {
            question: "Apa nama layanan berbagi dokumen dari Google?",
            answer: "google drive",
            options: ["dropbox", "google drive", "onedrive", "box"]
        },
        {
            question: "Apa nama sistem operasi untuk smart TV dari Samsung?",
            answer: "tizen",
            options: ["android tv", "tizen", "webos", "roku os"]
        },
        {
            question: "Apa nama asisten virtual Amazon?",
            answer: "alexa",
            options: ["alexa", "google assistant", "siri", "bixby"]
        },
        {
            question: "Apa nama layanan streaming video terbesar di dunia?",
            answer: "youtube",
            options: ["netflix", "youtube", "disney+", "amazon prime video"]
        },
        {
            question: "Apa nama sistem operasi open source yang gratis?",
            answer: "linux",
            options: ["windows", "macos", "linux", "chrome os"]
        },
        {
            question: "Apa nama perusahaan yang membuat processor Intel Core?",
            answer: "intel",
            options: ["amd", "intel", "nvidia", "qualcomm"]
        },
        {
            question: "Apa nama aplikasi pesan instan yang dimiliki Facebook?",
            answer: "whatsapp",
            options: ["telegram", "signal", "whatsapp", "wechat"]
        },
        {
            question: "Apa nama laptop yang bisa berubah menjadi tablet dari Microsoft?",
            answer: "surface",
            options: ["macbook", "surface", "thinkpad", "xps"]
        },
        {
            question: "Apa nama teknologi nirkabel untuk transfer data jarak dekat?",
            answer: "bluetooth",
            options: ["bluetooth", "wifi", "nfc", "5g"]
        },
        {
            question: "Apa nama layanan penyimpanan foto dari Google?",
            answer: "google photos",
            options: ["google drive", "google photos", "icloud", "flickr"]
        },
        {
            question: "Apa nama virtual assistant dari Samsung?",
            answer: "bixby",
            options: ["bixby", "alexa", "cortana", "google assistant"]
        },
        {
            question: "Apa nama game MOBA populer dari Riot Games?",
            answer: "league of legends",
            options: ["dota 2", "league of legends", "heroes of the storm", "smite"]
        },
        {
            question: "Apa nama teknologi layar sentuh pada smartphone?",
            answer: "capacitive touchscreen",
            options: ["resistive touchscreen", "capacitive touchscreen", "infrared touchscreen", "optical touchscreen"]
        },
        {
            question: "Apa nama sistem pembayaran digital dari Apple?",
            answer: "apple pay",
            options: ["apple pay", "google pay", "samsung pay", "paypal"]
        },
        {
            question: "Apa nama chip khusus AI di smartphone modern?",
            answer: "neural engine",
            options: ["neural engine", "gpu", "cpu", "tpu"]
        },
        {
            question: "Apa nama game survival crafting yang sangat populer?",
            answer: "minecraft",
            options: ["terraria", "minecraft", "stardew valley", "rust"]
        },
        {
            question: "Apa nama layanan berlangganan Office dari Microsoft?",
            answer: "microsoft 365",
            options: ["google workspace", "microsoft 365", "libreoffice", "zoho office"]
        },
        {
            question: "Apa nama browser yang dikembangkan oleh Mozilla?",
            answer: "firefox",
            options: ["chrome", "edge", "firefox", "opera"]
        },
        {
            question: "Apa nama teknologi pengisian daya nirkabel?",
            answer: "qi",
            options: ["qi", "airfuel", "powermat", "wifi charging"]
        },
        {
            question: "Apa nama sistem operasi untuk smartwatch dari Apple?",
            answer: "watchos",
            options: ["wear os", "watchos", "tizen", "harmony os"]
        },
        {
            question: "Apa nama game battle royale dari Respawn Entertainment?",
            answer: "apex legends",
            options: ["fortnite", "apex legends", "pubg", "call of duty warzone"]
        },
        {
            question: "Apa nama teknologi pengenalan wajah di iPhone?",
            answer: "face id",
            options: ["face id", "touch id", "iris scan", "fingerprint sensor"]
        },
        {
            question: "Apa nama layanan cloud storage dari Dropbox?",
            answer: "dropbox",
            options: ["dropbox", "google drive", "onedrive", "box"]
        }
    ],   
    sedang: [
        {
            question: "Apa protokol yang digunakan untuk mengirim email?",
            answer: "smtp",
            options: ["http", "ftp", "smtp", "tcp"]
        },
        {
            question: "Apa nama database NoSQL populer dari MongoDB?",
            answer: "mongodb",
            options: ["mysql", "postgresql", "mongodb", "sqlite"]
        },
        {
            question: "Apa nama framework JavaScript untuk membangun UI?",
            answer: "react",
            options: ["angular", "react", "vue", "svelte"]
        },
        {
            question: "Apa nama bahasa pemrograman yang dikembangkan Google?",
            answer: "go",
            options: ["dart", "go", "kotlin", "swift"]
        },
        {
            question: "Apa nama alat kontrol versi yang populer?",
            answer: "git",
            options: ["git", "svn", "mercurial", "cvs"]
        },
        {
            question: "Apa nama layanan komputasi awan dari Amazon?",
            answer: "aws",
            options: ["aws", "azure", "google cloud", "ibm cloud"]
        },
        {
            question: "Apa nama token kripto dari platform Ethereum?",
            answer: "ether",
            options: ["bitcoin", "ether", "solana", "cardano"]
        },
        {
            question: "Apa nama bahasa pemrograman untuk analisis data?",
            answer: "python",
            options: ["java", "python", "r", "julia"]
        },
        {
            question: "Apa nama sistem operasi Linux populer untuk server?",
            answer: "ubuntu",
            options: ["ubuntu", "fedora", "arch", "debian"]
        },
        {
            question: "Apa nama alat untuk mengelola dependencies JavaScript?",
            answer: "npm",
            options: ["npm", "yarn", "pip", "composer"]
        },
        {
            question: "Apa nama teknologi realitas tertambah dari Apple?",
            answer: "arkit",
            options: ["arcore", "arkit", "vuforia", "magic leap"]
        },
        {
            question: "Apa nama framework CSS populer?",
            answer: "bootstrap",
            options: ["bootstrap", "tailwind", "foundation", "bulma"]
        },
        {
            question: "Apa nama bahasa query untuk database?",
            answer: "sql",
            options: ["sql", "nosql", "graphql", "json"]
        },
        {
            question: "Apa nama teknologi untuk membuat website interaktif?",
            answer: "javascript",
            options: ["html", "css", "javascript", "php"]
        },
        {
            question: "Apa nama alat pengembangan dari JetBrains untuk JavaScript?",
            answer: "webstorm",
            options: ["vscode", "webstorm", "sublime", "atom"]
        },
        {
            question: "Apa nama virtual machine untuk menjalankan bytecode Java?",
            answer: "jvm",
            options: ["jvm", "clr", "v8", "llvm"]
        },
        {
            question: "Apa nama teknologi blockchain untuk kontrak pintar?",
            answer: "ethereum",
            options: ["bitcoin", "ethereum", "ripple", "litecoin"]
        },
        {
            question: "Apa nama sistem build tool untuk Java?",
            answer: "maven",
            options: ["ant", "maven", "gradle", "make"]
        },
        {
            question: "Apa nama teknologi untuk membuat aplikasi desktop dengan web tech?",
            answer: "electron",
            options: ["electron", "flutter", "react native", "xamarin"]
        },
        {
            question: "Apa nama protokol untuk transfer file yang aman?",
            answer: "sftp",
            options: ["ftp", "sftp", "http", "smb"]
        },
        {
            question: "Apa nama database graph populer?",
            answer: "neo4j",
            options: ["mongodb", "neo4j", "cassandra", "redis"]
        },
        {
            question: "Apa nama teknologi untuk containerisasi aplikasi?",
            answer: "docker",
            options: ["docker", "kubernetes", "vagrant", "virtualbox"]
        },
        {
            question: "Apa nama alat untuk mengotomatisasi tugas JavaScript?",
            answer: "gulp",
            options: ["grunt", "gulp", "webpack", "parcel"]
        },
        {
            question: "Apa nama sistem manajemen konten open source?",
            answer: "wordpress",
            options: ["wordpress", "joomla", "drupal", "magento"]
        },
        {
            question: "Apa nama package manager untuk bahasa Python?",
            answer: "pip",
            options: ["npm", "pip", "composer", "gradle"]
        },
        {
            question: "Apa nama runtime JavaScript di luar browser?",
            answer: "node.js",
            options: ["node.js", "deno", "bun", "electron"]
        },
        {
            question: "Apa nama paradigma pemrograman yang digunakan React?",
            answer: "functional programming",
            options: ["object-oriented", "functional programming", "procedural", "logic programming"]
        },
        {
            question: "Apa nama alat untuk virtualisasi sistem operasi?",
            answer: "docker",
            options: ["docker", "virtualbox", "vmware", "hyper-v"]
        },
        {
            question: "Apa nama protocol untuk transfer file yang aman?",
            answer: "sftp",
            options: ["ftp", "sftp", "http", "smb"]
        },
        {
            question: "Apa nama database relasional open source populer?",
            answer: "postgresql",
            options: ["mysql", "postgresql", "sqlite", "oracle"]
        },
        {
            question: "Apa nama algoritma enkripsi yang digunakan HTTPS?",
            answer: "tls",
            options: ["ssl", "tls", "aes", "rsa"]
        },
        {
            question: "Apa nama tools untuk mengotomatisasi deployment?",
            answer: "jenkins",
            options: ["jenkins", "travis ci", "github actions", "circleci"]
        },
        {
            question: "Apa nama bahasa pemrograman untuk data science?",
            answer: "python",
            options: ["java", "python", "r", "julia"]
        },
        {
            question: "Apa nama sistem manajemen versi terdistribusi?",
            answer: "git",
            options: ["git", "svn", "mercurial", "cvs"]
        },
        {
            question: "Apa nama framework CSS utility-first?",
            answer: "tailwind css",
            options: ["bootstrap", "tailwind css", "foundation", "bulma"]
        },
        {
            question: "Apa nama teknologi untuk membuat aplikasi mobile dengan JavaScript?",
            answer: "react native",
            options: ["flutter", "react native", "xamarin", "ionic"]
        },
        {
            question: "Apa nama bahasa pemrograman untuk smart contract di Cardano?",
            answer: "plutus",
            options: ["solidity", "plutus", "rust", "vyper"]
        },
        {
            question: "Apa nama algoritma konsensus yang digunakan Polkadot?",
            answer: "nominated proof-of-stake",
            options: ["proof-of-work", "delegated proof-of-stake", "nominated proof-of-stake", "proof-of-authority"]
        },
        {
            question: "Apa nama token standard untuk stablecoin di Ethereum?",
            answer: "erc-20",
            options: ["erc-20", "erc-721", "erc-1155", "erc-777"]
        },
        {
            question: "Apa nama teknologi untuk penskalaan blockchain dengan sidechains?",
            answer: "plasma",
            options: ["sharding", "plasma", "rollups", "state channels"]
        },
        {
            question: "Apa nama protokol untuk komunikasi terdesentralisasi?",
            answer: "libp2p",
            options: ["http", "libp2p", "tcp/ip", "webrtc"]
        },
        {
            question: "Apa nama database time-series untuk crypto?",
            answer: "influxdb",
            options: ["mongodb", "influxdb", "timescaledb", "prometheus"]
        },
        {
            question: "Apa nama teknologi untuk verifikasi formal smart contract?",
            answer: "formal verification",
            options: ["unit testing", "formal verification", "static analysis", "fuzzing"]
        },
        {
            question: "Apa nama algoritma yang digunakan dalam zk-SNARKs?",
            answer: "elliptic curve cryptography",
            options: ["rsa", "elliptic curve cryptography", "sha-256", "aes"]
        }
    ],
    sulit: [
        {
            question: "Apa nama algoritma yang digunakan dalam proof-of-work Bitcoin?",
            answer: "sha-256",
            options: ["sha-256", "scrypt", "ethash", "equihash"]
        },
        {
            question: "Apa nama struktur data dasar dalam blockchain?",
            answer: "linked list",
            options: ["array", "hash table", "linked list", "tree"]
        },
        {
            question: "Apa nama protokol layer-2 untuk penskalaan Ethereum?",
            answer: "rollup",
            options: ["sharding", "rollup", "sidechain", "plasma"]
        },
        {
            question: "Apa nama bahasa domain-specific untuk smart contract?",
            answer: "solidity",
            options: ["vyper", "solidity", "rust", "move"]
        },
        {
            question: "Apa nama mekanisme konsensus yang digunakan Cardano?",
            answer: "ouroboros",
            options: ["ouroboros", "tendermint", "paxos", "raft"]
        },
        {
            question: "Apa nama teknologi zero-knowledge proof populer?",
            answer: "zk-snark",
            options: ["zk-snark", "zk-stark", "bulletproof", "plonk"]
        },
        {
            question: "Apa nama virtual machine Ethereum?",
            answer: "evm",
            options: ["jvm", "evm", "wasm", "llvm"]
        },
        {
            question: "Apa nama standar token non-fungible di Ethereum?",
            answer: "erc-721",
            options: ["erc-20", "erc-721", "erc-1155", "erc-777"]
        },
        {
            question: "Apa nama masalah dalam blockchain tentang kecepatan transaksi?",
            answer: "scalability",
            options: ["security", "scalability", "decentralization", "privacy"]
        },
        {
            question: "Apa nama algoritma hash yang digunakan Ethereum?",
            answer: "keccak-256",
            options: ["sha-3", "keccak-256", "blake2", "groestl"]
        },
        {
            question: "Apa nama serangan 51% terhadap blockchain?",
            answer: "majority attack",
            options: ["sybil attack", "majority attack", "ddos", "eclipse attack"]
        },
        {
            question: "Apa nama teknologi untuk pertukaran atom antar blockchain?",
            answer: "atomic swap",
            options: ["atomic swap", "cross-chain bridge", "sidechain", "relay chain"]
        },
        {
            question: "Apa nama protokol privacy coin populer?",
            answer: "zerocoin",
            options: ["zerocoin", "confidential transactions", "ringct", "mimblewimble"]
        },
        {
            question: "Apa nama database terdistribusi dalam IPFS?",
            answer: "ipld",
            options: ["ipld", "orbitdb", "gun", "bigchaindb"]
        },
        {
            question: "Apa nama sistem file terdesentralisasi?",
            answer: "ipfs",
            options: ["ipfs", "sia", "storj", "filecoin"]
        },
        {
            question: "Apa nama teknologi untuk oracle blockchain?",
            answer: "chainlink",
            options: ["chainlink", "band protocol", "nest", "tellorflex"]
        },
        {
            question: "Apa nama standar untuk wallet deterministik?",
            answer: "bip-39",
            options: ["bip-32", "bip-39", "bip-44", "bip-69"]
        },
        {
            question: "Apa nama algoritma konsensus yang digunakan Ripple?",
            answer: "rpca",
            options: ["pbft", "rpca", "dpos", "pow"]
        },
        {
            question: "Apa nama teknologi sharding di Ethereum 2.0?",
            answer: "danksharding",
            options: ["danksharding", "zksharding", "plasma", "state channels"]
        },
        {
            question: "Apa nama lapisan keamanan untuk smart contract?",
            answer: "formal verification",
            options: ["formal verification", "static analysis", "fuzzing", "audit manual"]
        },
        {
            question: "Apa nama protokol untuk memvalidasi transaksi ringan?",
            answer: "light client",
            options: ["full node", "light client", "archive node", "mining node"]
        },
        {
            question: "Apa nama masalah triple spending dalam blockchain?",
            answer: "nothing at stake",
            options: ["nothing at stake", "double spending", "byzantine fault", "long range attack"]
        },
        {
            question: "Apa nama teknologi untuk penskalaan off-chain?",
            answer: "state channels",
            options: ["sidechains", "state channels", "plasma", "rollups"]
        },
        {
            question: "Apa nama algoritma yang digunakan Monero untuk privasi?",
            answer: "ring signatures",
            options: ["zk-snarks", "ring signatures", "bulletproofs", "mimblewimble"]
        },
        {
            question: "Apa nama teknik optimasi gas untuk smart contract Ethereum?",
            answer: "storage packing",
            options: ["storage packing", "loop unrolling", "memory caching", "gas refunds"]
        },
        {
            question: "Apa nama vulnerability yang memungkinkan double spending di blockchain?",
            answer: "race condition",
            options: ["reentrancy", "race condition", "integer overflow", "front-running"]
        },
        {
            question: "Apa nama teknik untuk meningkatkan privasi di Ethereum?",
            answer: "zk-rollups",
            options: ["zk-rollups", "plasma", "state channels", "sidechains"]
        },
        {
            question: "Apa nama protokol layer-0 untuk interoperabilitas blockchain?",
            answer: "cosmos",
            options: ["polkadot", "cosmos", "avalanche", "chainlink"]
        },
        {
            question: "Apa nama bahasa pemrograman untuk Move di blockchain Libra?",
            answer: "move",
            options: ["solidity", "move", "rust", "vyper"]
        },
        {
            question: "Apa nama teknik sharding yang digunakan Near Protocol?",
            answer: "nightshade",
            options: ["danksharding", "nightshade", "omnishard", "zkshard"]
        },
        {
            question: "Apa nama mekanisme konsensus yang digunakan Solana?",
            answer: "proof-of-history",
            options: ["proof-of-history", "tower bft", "practical byzantine fault tolerance", "delegated proof-of-stake"]
        },
        {
            question: "Apa nama teknologi cross-chain messaging di Polkadot?",
            answer: "xcmp",
            options: ["xcmp", "ibc", "chainlink", "wormhole"]
        },
        {
            question: "Apa nama algoritma proof-of-space yang digunakan Chia?",
            answer: "chia proof-of-space",
            options: ["chia proof-of-space", "burstcoin proof-of-capacity", "filecoin proof-of-replication", "storj proof-of-storage"]
        },
        {
            question: "Apa nama vulnerability pada smart contract yang terkenal di DAO hack?",
            answer: "reentrancy",
            options: ["reentrancy", "integer overflow", "unchecked return values", "timestamp dependence"]
        },
        {
            question: "Apa nama teknik untuk meminimalkan on-chain data di rollups?",
            answer: "data availability sampling",
            options: ["data compression", "data availability sampling", "merkle proofs", "zero-knowledge proofs"]
        },
        {
            question: "Apa nama protokol privacy-preserving untuk DeFi?",
            answer: "tornado cash",
            options: ["tornado cash", "aztec protocol", "zether", "keep network"]
        },
        {
            question: "Apa nama teknologi untuk memverifikasi komputasi off-chain?",
            answer: "optimistic rollups",
            options: ["optimistic rollups", "zk-rollups", "validium", "plasma"]
        },
        {
            question: "Apa nama standar untuk multi-token di Ethereum?",
            answer: "erc-1155",
            options: ["erc-20", "erc-721", "erc-1155", "erc-777"]
        },
        {
            question: "Apa nama teknik untuk mengurangi ukuran transaksi Bitcoin?",
            answer: "segwit",
            options: ["segwit", "taproot", "schnorr signatures", "batching"]
        },
        {
            question: "Apa nama algoritma yang digunakan dalam proof-of-stake Ethereum?",
            answer: "casper ffg",
            options: ["casper ffg", "tendermint", "ouroboros", "algorand"]
        },
        {
            question: "Apa nama teknologi untuk memvalidasi transaksi tanpa mengunduh seluruh blockchain?",
            answer: "light clients",
            options: ["light clients", "fraud proofs", "zk-proofs", "bloom filters"]
        },
        {
            question: "Apa nama teknik untuk mengamankan bridge cross-chain?",
            answer: "multi-sig",
            options: ["multi-sig", "atomic swaps", "threshold signatures", "zk-proofs"]
        },
        {
            question: "Apa nama vulnerability yang memanfaatkan perbedaan harga di DEX?",
            answer: "front-running",
            options: ["front-running", "sandwich attack", "flash loan attack", "reentrancy"]
        },
        {
            question: "Apa nama protokol untuk memprediksi harga di DeFi?",
            answer: "chainlink",
            options: ["chainlink", "band protocol", "nest", "uma"]
        }
    ]
};
        
        // Pilih pertanyaan random berdasarkan difficulty
        const questionSet = questions[difficulty];
        const questionData = questionSet[Math.floor(Math.random() * questionSet.length)];
        
        let timeLimit = difficulty === 'mudah' ? 30 : (difficulty === 'sedang' ? 45 : 60);
        
        // Atur warna embed berdasarkan kesulitan
        const difficultyColors = {
            mudah: '#55C2FF',  // Biru muda
            sedang: '#FFA500',  // Orange
            sulit: '#FF5555'    // Merah
        };
        
        // Atur emoji berdasarkan kesulitan
        const difficultyEmoji = {
            mudah: '🟢',  // Hijau
            sedang: '🟠',  // Orange  
            sulit: '🔴'    // Merah
        };
        
        // Kirim pertanyaan
        const embed = new EmbedBuilder()
            .setColor(difficultyColors[difficulty])
            .setTitle(`${difficultyEmoji[difficulty]} Kuis Berhadiah (${difficulty.toUpperCase()})`)
            .setDescription(`**${questionData.question}**`)
            .addFields(
                { name: 'Pilihan', value: questionData.options.map((opt, i) => `${i+1}. ${opt}`).join('\n'), inline: false },
                { name: 'Cara Menjawab', value: 'Ketik angka atau jawaban dalam waktu yang ditentukan!', inline: false },
                { name: 'Hadiah', value: `${reward} koin`, inline: true },
                { name: 'Waktu', value: `${timeLimit} detik`, inline: true }
            )
            .setFooter({ text: `${message.author.username} • Tingkat: ${difficulty}` })
            .setTimestamp();
            
        const quizMessage = await message.reply({ embeds: [embed] });
            
        // Bikin collector untuk jawaban
        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: timeLimit * 1000, max: 1 });
        
        collector.on('collect', answer => {
            const userAnswer = answer.content.toLowerCase().trim();
            
            // Cek jawaban (nomor atau text)
            const correctIndex = questionData.options.indexOf(questionData.answer);
            const isCorrect = 
                userAnswer === questionData.answer || 
                userAnswer === (correctIndex + 1).toString();
            
            if (isCorrect) {
                // Jawaban benar
                userData.saldo += reward;
                
                // Hitung streak
                userData.kuis_streak = (userData.kuis_streak || 0) + 1;
                
                // Bonus streak (setiap 5 streak dapat bonus tambahan)
                let streakBonus = 0;
                if (userData.kuis_streak % 5 === 0) {
                    streakBonus = 100 * Math.floor(userData.kuis_streak / 5);
                    userData.saldo += streakBonus;
                }
                
                const correctEmbed = new EmbedBuilder()
                    .setColor('#55FF55')
                    .setTitle('✅ Jawaban Benar!')
                    .setDescription(`Selamat! Jawaban **"${questionData.answer}"** benar.`)
                    .addFields(
                        { name: 'Hadiah', value: `${reward} koin`, inline: true },
                        { name: 'Streak', value: `${userData.kuis_streak}x`, inline: true },
                        { name: 'Saldo Sekarang', value: `${userData.saldo} koin`, inline: true }
                    );
                
                // Tambahkan informasi bonus streak jika ada
                if (streakBonus > 0) {
                    correctEmbed.addFields({ 
                        name: '🔥 Bonus Streak!', 
                        value: `+${streakBonus} koin bonus untuk ${userData.kuis_streak} kuis berturut-turut!`,
                        inline: false 
                    });
                }
                    
                quizMessage.reply({ embeds: [correctEmbed] });
            } else {
                // Jawaban salah
                userData.kuis_streak = 0; // Reset streak
                
                const wrongEmbed = new EmbedBuilder()
                    .setColor('#FF5555')
                    .setTitle('❌ Jawaban Salah!')
                    .setDescription(`Jawaban yang benar adalah **"${questionData.answer}"**`)
                    .addFields(
                        { name: 'Saldo Tetap', value: `${userData.saldo} koin`, inline: true },
                        { name: 'Streak', value: `Reset ke 0`, inline: true }
                    );
                    
                quizMessage.reply({ embeds: [wrongEmbed] });
            }
            
            // Update statistik
            userData.statistik = userData.statistik || {};
            userData.statistik.game_dimainkan = (userData.statistik.game_dimainkan || 0) + 1;
            userData.statistik.command_digunakan = (userData.statistik.command_digunakan || 0) + 1;
            userData.statistik.kuis_dijawab = (userData.statistik.kuis_dijawab || 0) + 1;
            
            if (isCorrect) {
                userData.statistik.kuis_benar = (userData.statistik.kuis_benar || 0) + 1;
            } else {
                userData.statistik.kuis_salah = (userData.statistik.kuis_salah || 0) + 1;
            }
            
            // Simpan database
            client.db.save(client.database);
        });
        
        collector.on('end', collected => {
            if (collected.size === 0) {
                // Reset streak jika tidak menjawab
                userData.kuis_streak = 0;
                
                // Tidak menjawab
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#FF5555')
                    .setTitle('⏰ Waktu Habis!')
                    .setDescription(`Jawaban yang benar adalah **"${questionData.answer}"**`)
                    .addFields(
                        { name: 'Streak', value: 'Reset ke 0', inline: true }
                    )
                    .setFooter({ text: 'Coba lagi nanti!' });
                    
                quizMessage.reply({ embeds: [timeoutEmbed] });
                
                // Update statistik
                userData.statistik = userData.statistik || {};
                userData.statistik.game_dimainkan = (userData.statistik.game_dimainkan || 0) + 1;
                userData.statistik.command_digunakan = (userData.statistik.command_digunakan || 0) + 1;
                userData.statistik.kuis_timeout = (userData.statistik.kuis_timeout || 0) + 1;
                
                // Simpan database
                client.db.save(client.database);
            }
        });
    }
};