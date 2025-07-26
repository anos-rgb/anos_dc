const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cooking',
    description: 'Masak makanan dan jual buat dapetin koin',
    aliases: ['cook', 'masak'],
    cooldown: 12,
    execute(message, args, client) {
        const userData = client.database.users[message.author.id];
        
        const now = Date.now();
        const lastCook = userData.statistik.cooking_terakhir || 0;
        const timeLeft = 43200000 - (now - lastCook);
        
        if (lastCook && timeLeft > 0) {
            const hours = Math.floor(timeLeft / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);
            return message.reply(`Dapur lo masih sibuk! Tunggu ${hours} jam ${minutes} menit lagi.`);
        }
        
        const dishes = [
            { name: "Nasi Goreng", cost: 50, price: 150, emoji: "🍳" },
            { name: "Mie Ayam", cost: 40, price: 120, emoji: "🍜" },
            { name: "Sate Ayam", cost: 60, price: 180, emoji: "🍢" },
            { name: "Gado-gado", cost: 30, price: 100, emoji: "🥗" },
            { name: "Rendang", cost: 80, price: 250, emoji: "🍛" },
            { name: "Soto Betawi", cost: 70, price: 200, emoji: "🍲" },
            { name: "Gudeg", cost: 65, price: 190, emoji: "🍚" }
        ];
        
        const dish = dishes[Math.floor(Math.random() * dishes.length)];
        const cookingSkill = Math.random() * 0.5 + 0.7;
        const customerSatisfaction = Math.random() * 0.4 + 0.8;
        
        if (userData.saldo < dish.cost) {
            return message.reply(`Lo butuh ${dish.cost} koin buat beli bahan ${dish.name}!`);
        }
        
        userData.saldo -= dish.cost;
        
        const finalPrice = Math.floor(dish.price * cookingSkill * customerSatisfaction);
        const profit = finalPrice - dish.cost;
        
        userData.saldo += finalPrice;
        userData.statistik.cooking_terakhir = now;
        userData.statistik.command_digunakan++;
        
        let rating = '';
        if (cookingSkill >= 0.9) rating = '⭐⭐⭐⭐⭐ Masterchef!';
        else if (cookingSkill >= 0.8) rating = '⭐⭐⭐⭐ Excellent!';
        else if (cookingSkill >= 0.7) rating = '⭐⭐⭐ Good!';
        else rating = '⭐⭐ Average';
        
        client.db.save(client.database);
        
        const embed = new EmbedBuilder()
            .setColor('#FF6347')
            .setTitle('👨‍🍳 Cooking Business')
            .setDescription(`Lo berhasil masak ${dish.emoji} ${dish.name}!`)
            .addFields(
                { name: 'Rating', value: rating, inline: true },
                { name: 'Modal', value: `${dish.cost} koin`, inline: true },
                { name: 'Jual', value: `${finalPrice} koin`, inline: true },
                { name: 'Profit', value: `${profit} koin`, inline: true },
                { name: 'Skill', value: `${Math.floor(cookingSkill * 100)}%`, inline: true },
                { name: 'Saldo', value: `${userData.saldo} koin`, inline: true }
            )
            .setFooter({ text: 'Cooking cooldown: 12 jam' });
            
        message.reply({ embeds: [embed] });
    }
};