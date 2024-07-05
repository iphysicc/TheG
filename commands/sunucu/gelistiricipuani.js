const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { JsonDatabase } = require("wio.db");

const db = new JsonDatabase({ databasePath: "./databases/gelistiricipuanlari.json" });

const logKanalID = '1258085488288596019'; 

module.exports = {
    cooldown: 5, 
    data: new SlashCommandBuilder()
        .setName('gelistiricipuani')
        .setDescription('Geliştirici puanı yönetimi komutları.')
        .addSubcommand(subcommand => 
            subcommand
                .setName('ver')
                .setDescription('Belirtilen kullanıcıya geliştirici puanı verir.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Puan verilecek kullanıcı.').setRequired(true))
                .addIntegerOption(option => option.setName('puan').setDescription('Verilecek puan miktarı.').setRequired(true))
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('al')
                .setDescription('Belirtilen kullanıcıdan geliştirici puanı alır.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Puan alınacak kullanıcı.').setRequired(true))
                .addIntegerOption(option => option.setName('puan').setDescription('Alınacak puan miktarı.').setRequired(true))
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('göster')
                .setDescription('Belirtilen kullanıcının geliştirici puanını gösterir.')
                .addUserOption(option => option.setName('kullanıcı').setDescription('Puanı gösterilecek kullanıcı.').setRequired(true))
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('siralama')
                .setDescription('Tüm kullanıcıların geliştirici puanı sıralamasını gösterir.')
        ),

    async execute(interaction) { 
        try {

            const subcommand = interaction.options.getSubcommand(); 
            const user = interaction.options.getUser('kullanıcı'); 
            const userId = user ? user.id : null; 

            if (subcommand === 'ver') { 
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) { 
                    await interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmalısın!', ephemeral: true });
                    return;
                }

                const puan = interaction.options.getInteger('puan');
                let mevcutPuan = db.get(`gelistiricipuan_${userId}`) || 0; 
                mevcutPuan += puan;
                db.set(`gelistiricipuan_${userId}`, mevcutPuan); 

                const riskSeviyesi = Math.floor(mevcutPuan / -5); 

                const embed = new EmbedBuilder() 
                    .setColor(0x00FF00)
                    .setTitle('Geliştirici Puanı Verildi')
                    .setDescription(`${user} adlı kullanıcıya ${puan} geliştirici puanı verildi.`)
                    .addFields(
                        { name: 'Toplam Puan', value: mevcutPuan.toString(), inline: true },
                        { name: 'Risk Seviyesi', value: riskSeviyesi.toString(), inline: true }
                    );

                await interaction.reply({ embeds: [embed] }); 

                const logKanal = interaction.guild.channels.cache.get(logKanalID);
                if (logKanal) {
                    const embed = new EmbedBuilder()
                        .setColor(subcommand === 'ver' ? 0x00FF00 : 0xFF0000)
                        .setTitle(`Geliştirici Puanı ${subcommand === 'ver' ? 'Verildi' : 'Alındı'}`)
                        .setDescription(`
                            **Yetkili:** <@${interaction.user.id}>
                            **Kullanıcı:** <@${userId}>
                            **${subcommand === 'ver' ? 'Verilen' : 'Alınan'} Puan:** ${puan}
                            **Toplam Puan:** ${mevcutPuan}
                            **Risk Seviyesi:** ${riskSeviyesi}
                        `);
                    await logKanal.send({ embeds: [embed] });
                } else {
                    console.error("Log kanalı bulunamadı!");
                }
            } else if (subcommand === 'al') { 
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    await interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmalısın!', ephemeral: true });
                    return;
                }

                const puan = interaction.options.getInteger('puan');
                let mevcutPuan = db.get(`gelistiricipuan_${userId}`) || 0;
                mevcutPuan -= puan; 
                db.set(`gelistiricipuan_${userId}`, mevcutPuan);

                const riskSeviyesi = Math.floor(mevcutPuan / -5);

                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Geliştirici Puanı Alındı')
                    .setDescription(`${user} adlı kullanıcıdan ${puan} geliştirici puanı alındı.`)
                    .addFields(
                        { name: 'Toplam Puan', value: mevcutPuan.toString(), inline: true },
                        { name: 'Risk Seviyesi', value: riskSeviyesi.toString(), inline: true }
                    );

                await interaction.reply({ embeds: [embed] });

                const logKanal = interaction.guild.channels.cache.get(logKanalID);
                if (logKanal) {
                    const embed = new EmbedBuilder()
                        .setColor(subcommand === 'ver' ? 0x00FF00 : 0xFF0000)
                        .setTitle(`Geliştirici Puanı ${subcommand === 'ver' ? 'Verildi' : 'Alındı'}`)
                        .setDescription(`
                            **Yetkili:** <@${interaction.user.id}>
                            **Kullanıcı:** <@${userId}>
                            **${subcommand === 'ver' ? 'Verilen' : 'Alınan'} Puan:** ${puan}
                            **Toplam Puan:** ${mevcutPuan}
                            **Risk Seviyesi:** ${riskSeviyesi}
                        `);
                    await logKanal.send({ embeds: [embed] });
                } else {
                    console.error("Log kanalı bulunamadı!");
                }
            } else if (subcommand === 'göster') { 
                const puan = db.get(`gelistiricipuan_${userId}`) || 0;
                const riskSeviyesi = Math.floor(puan / -5);

                const embed = new EmbedBuilder()
                    .setColor(0x0000FF)
                    .setTitle('Geliştirici Puanı')
                    .setDescription(`${user} adlı kullanıcının ${puan} geliştirici puanı var.`)
                    .addFields(
                        { name: 'Toplam Puan', value: puan.toString(), inline: true },
                        { name: 'Risk Seviyesi', value: riskSeviyesi.toString(), inline: true }
                    );

                await interaction.reply({ embeds: [embed] });
            } else if (subcommand === 'siralama') {
                const allData = db.all(); 
                      
                const puanlar = allData
                    .filter(entry => entry.ID.startsWith('gelistiricipuan_')) 
                    .map(entry => ({ id: entry.ID.split('_')[1], puan: entry.data })) 
                    .sort((a, b) => b.puan - a.puan); 
            
                const description = puanlar.length > 0
                    ? puanlar.map((entry, index) => `${index + 1}. <@${entry.id}> = ${entry.puan} puan`).join('\n')
                    : 'Henüz kimsenin geliştirici puanı yok.';
            
                const embed = new EmbedBuilder()
                    .setColor(0xFFFF00)
                    .setTitle('Geliştirici Puanı Sıralaması')
                    .setDescription(description);
            
                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) { 
            console.error("Komutta hata oluştu:", error);
            await interaction.reply({ content: 'Komutta bir hata oluştu.', ephemeral: true }); 
        }
    }
};
