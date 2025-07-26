const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'menu',
  aliases: ['help','cmds'],
  cooldown: 3,
  execute(msg, args, client) {
    const dir = path.join(__dirname, '..');
    const colors = ['#FF6B9D','#4FACFE','#43E97B','#FA709A','#667EEA'];
    const color = ()=>colors[Math.floor(Math.random()*colors.length)];
    const uid = msg.author.id;
    const u = client.database.users[uid] || { saldo:0, statistik:{command_digunakan:0} };

    const allowed = ['admin','ekonomi','game','menubot','moderation','random','toko'];
    const cats = {};
    allowed.forEach(c=>{
      cats[c]=[];
      const p = path.join(dir,c);
      if(!fs.existsSync(p)) return;
      fs.readdirSync(p).forEach(f=>{
        if(!f.endsWith('.js')) return;
        try{
          const cmd = require(path.join(p,f));
          if(cmd.name) cats[c].push(cmd);
        }catch{}
      });
    });

    const total = Object.values(cats).reduce((a,b)=>a+b.length,0);

    // kalo ada arg & match category
    if(args[0]){
      const q=args[0].toLowerCase();
      if(cats[q]){
        const list = cats[q];
        const embed = new EmbedBuilder()
          .setColor(color())
          .setTitle(`🎮 ${q.toUpperCase()} — ${list.length} cmd`)
          .setDescription(list.map((cmd,i)=>`**${i+1}.** \`${cmd.name}\` — ${cmd.description||'-'}`).join('\n'))
          .setFooter({text:'!menu <command> buat detail'});
        return msg.reply({embeds:[embed]});
      }
      // cari command
      for(const [c,list] of Object.entries(cats)){
        const found=list.find(cmd=>cmd.name===q||cmd.aliases?.includes(q));
        if(found){
          return msg.reply({embeds:[
            new EmbedBuilder()
            .setColor(color())
            .setTitle(found.name.toUpperCase())
            .setDescription(found.description||'tanpa deskripsi')
            .addFields(
              {name:'Kategori',value:c,inline:true},
              {name:'Cooldown',value:`${found.cooldown||0}s`,inline:true},
              {name:'Aliases',value:found.aliases?.join(', ')||'tidak ada',inline:true}
            )
            .setFooter({text:`req by ${msg.author.tag}`,iconURL:msg.author.displayAvatarURL()})
          ]});
        }
      }
      return msg.reply({embeds:[new EmbedBuilder().setColor('#ff0000').setDescription(`Category / command \`${q}\` gak ada!`)]});
    }

    // default: list category
    const embed = new EmbedBuilder()
      .setColor(color())
      .setTitle('📋 ANOS BOT MENU')
      .setDescription(`**Total Command:** ${total}\n**Saldo lu:** ${u.saldo.toLocaleString()} 💰\n**Command dipake:** ${u.statistik.command_digunakan}`)
      .addFields(
        {name:'Kategori Tersedia',value:Object.keys(cats).map(c=>`\`${c}\` (${cats[c].length})`).join(' | ')},
        {name:'Cara pakai',value:'`!menu <kategori>` → liat cmd di kategori\n`!menu <command>` → detail cmd'}
      )
      .setFooter({text:'Support dev: https://saweria.co/anos6501'});
    msg.reply({embeds:[embed]});
    u.statistik.command_digunakan++;
    if(client.db?.save) client.db.save(client.database);
  }
};