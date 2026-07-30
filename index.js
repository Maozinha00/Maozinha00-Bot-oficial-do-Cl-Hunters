/**
 * ============================================================================
 * BOT AUTOMÁTICO DE REGISTRO (SET), CONFIRMAÇÃO DE REGRAS & INATIVIDADE DE 3 DIAS
 * CLÃ HUNTERS & FAMÍLIA SOUZA
 * ============================================================================
 * 
 * 📜 REGRAS E CONFIRMAÇÃO OBRIGATÓRIA DE LEITURA:
 * - O jogador DEVE clicar no botão "Confirmar Leitura das Regras" antes de pedir o SET.
 * - O bot registra a confirmação e avisa a Staff na aprovação:
 *   "📜 Regras Lidas: ✅ SIM - Confirmado pelo jogador".
 * - Inclui a regra de INATIVIDADE: "Ficar 3 dias sem entrar no servidor sem aviso
 *   resultará na remoção do painel e do clã."
 * 
 * Instalação: npm install discord.js dotenv express
 */

require('dotenv').config();
const express = require('express');
const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Events,
    PermissionsBitField
} = require("discord.js");

// ===============================
// CONFIGURAÇÃO DE AMBIENTE & TOKEN
// ===============================
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
    console.warn("⚠️ AVISO: Configure a variável 'DISCORD_TOKEN' no seu arquivo .env!");
}

// Map em memória para registrar se o jogador confirmou a leitura das regras
const confirmacoesRegras = new Map();

// ===============================
// CONFIGURAÇÃO GERAL DO SISTEMA
// ===============================
const CONFIG = {
    CLIENT_ID: process.env.CLIENT_ID || "1493598260546375881",
    GUILD_ID: process.env.GUILD_ID || "1456655598031601727",
    
    // IDs dos Canais do Servidor
    CANAL_REGISTRO_ID: process.env.CANAL_REGISTRO_ID || "1515448138385592361",
    CANAL_APROVACAO_ID: process.env.CANAL_APROVACAO_ID || "1515448473246498866",
    CANAL_LOGS_ID: process.env.CANAL_LOGS_ID || "1515448473246498866",
    CANAL_ENTRADA_SAIDA_ID: process.env.CANAL_ENTRADA_SAIDA_ID || "1524222632923496509",
    
    // IDs do Painel de Ausência
    CANAL_PAINEL_AUSENCIA_ID: process.env.CANAL_PAINEL_AUSENCIA_ID || "1531070382365343774",
    CANAL_AUSENCIA_LOGS_ID: process.env.CANAL_AUSENCIA_LOGS_ID || "1531670383483158700",

    // Cargos Administradores Autorizados a Aprovar
    CARGOS_ADMINS_APROVADORES: [
        process.env.CARGO_ADMIN_1 || "1515125820836941985",
        process.env.CARGO_ADMIN_2 || "1515125822795546715"
    ],

    CARGO_HUNTERS_RECRUTA_ID: process.env.CARGO_HUNTERS_RECRUTA || "1515125826780135485",

    EMBED_COLOR: "#2ECC71",
    EMBED_COLOR_AUSENCIA: "#E67E22",
    FOOTER: "Sistema de Gestão Clã Hunters • Confirmação de Regras & Set",

    GRUPOS: [
        {
            id: "grupo_hunters",
            name: "Hunters FiveZ",
            roleId: "1515125826780135485",
            emoji: "🎯",
            tag: "|HUNTERS REC|",
            description: "Caçadores de elite Hunters FiveZ (Recruta)"
        },
        {
            id: "grupo_souza",
            name: "Família Souza",
            roleId: "1515125828185493675",
            emoji: "❤️",
            tag: "|SOUZA|",
            description: "Membros oficiais da Família Souza"
        },
        {
            id: "grupo_comprador",
            name: "Comprador FiveZ",
            roleId: "1517662363266842725",
            emoji: "🛒",
            tag: "|CPD| FiveZ",
            description: "Compradores oficiais FiveZ"
        },
        {
            id: "grupo_amigos",
            name: "Amigos",
            roleId: "1515125842328424640",
            emoji: "🤝",
            tag: "|AMG|",
            description: "Cargo inicial de entrada e aliados"
        }
    ]
};

// ===============================
// SERVIDOR EXPRESS KEEP-ALIVE
// ===============================
const app = express();

app.get('/', (req, res) => {
    res.send('🟢 Bot Clã Hunters Discord Online 24/7!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor HTTP rodando na porta ${PORT}`);
});

// ===============================
// INSTÂNCIA DO CLIENTE DISCORD
// ===============================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

// Proteção Anti-Crash Global
process.on('unhandledRejection', (reason) => console.error('⚠️ [Anti-Crash] Rejeição:', reason));
process.on('uncaughtException', (error) => console.error('⚠️ [Anti-Crash] Exceção:', error));

// Auxiliar para formatar apelido
function formatarApelidoSeguro(tag, nome, id) {
    let nick = `${tag} ${nome} | ${id}`.trim();
    if (nick.length > 32) {
        const tamanhoExtra = tag.length + id.length + 4;
        const maxNome = Math.max(1, 32 - tamanhoExtra);
        nick = `${tag} ${nome.substring(0, maxNome)} | ${id}`.trim();
    }
    return nick.substring(0, 32);
}

// ===============================
// EVENTOS DO BOT
// ===============================
client.once(Events.ClientReady, (c) => {
    console.log(`🤖 BOT CLÃ HUNTERS CONECTADO COMO: ${c.user.tag}`);
});

// Remoção ativa de cargo automático na entrada
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        if (CONFIG.CARGO_HUNTERS_RECRUTA_ID && member.roles.cache.has(CONFIG.CARGO_HUNTERS_RECRUTA_ID)) {
            await member.roles.remove(CONFIG.CARGO_HUNTERS_RECRUTA_ID).catch(() => {});
        }

        if (CONFIG.CANAL_ENTRADA_SAIDA_ID) {
            const channel = member.guild.channels.cache.get(CONFIG.CANAL_ENTRADA_SAIDA_ID);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor(CONFIG.EMBED_COLOR)
                    .setTitle('🚪 BEM-VINDO AO CLÃ HUNTERS!')
                    .setDescription(`Seja bem-vindo(a) <@${member.id}>!\n\n> 📝 Dirija-se ao canal <#${CONFIG.CANAL_REGISTRO_ID}>\n> 📜 Leia e **confirme as regras** para poder solicitar o seu **SET / Registro**.\n> ⚠️ *Ficar 3 dias sem entrar sem aviso no painel de ausência resultará em remoção!*`)
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: CONFIG.FOOTER })
                    .setTimestamp();

                await channel.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
            }
        }
    } catch (err) {
        console.error('Erro no GuildMemberAdd:', err);
    }
});

// Comandos do Administrador (!painel e !painelausencia)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    const command = message.content.toLowerCase().trim();

    if (command === '!painel' || command === '!postarpainel') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem postar o painel.');
        }

        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setTitle('📜 REGRAS OBRIGATÓRIAS DO CLÃ HUNTERS')
            .setDescription(`Seja bem-vindo ao **CLÃ HUNTERS**!
Para garantir a organização e disciplina, leia e aceite as regras abaixo antes de solicitar seu **Set**.

📌 **1. RESPEITO E HIERARQUIA:**
Respeite a liderança e companheiros.

📌 **2. COMPROMISSO:**
Compareça às reuniões quando convocado.

📌 **3. USO OBRIGATÓRIO DA TAG:**
Utilize a tag [HUNTERS REC] ou [HUNTERS].

📌 **4. CANAIS E DMs:**
Mantenha os chats organizados.

📌 **5. INATIVIDADE DE 3 DIAS:**
🚨 **Ficar 3 dias sem entrar no servidor sem registrar a ausência no painel resultará na remoção do painel e do clã!**

📌 **6. DESLIGAMENTO:**
Descumprimento resultará em expulsão.

⚠️ **ATENÇÃO:** Clique no botão **"Confirmar Leitura das Regras"** abaixo para liberar a solicitação do seu Set!`)
            .setFooter({ text: CONFIG.FOOTER })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_confirmar_regras')
                .setLabel('Confirmar Leitura das Regras')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📜'),
            new ButtonBuilder()
                .setCustomId('btn_iniciar_registro')
                .setLabel('Solicitar Set / Registro')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎯')
        );

        await message.channel.send({ content: '@everyone', embeds: [embed], components: [row] });
        return message.reply('✅ Painel de regras e registro publicado com sucesso!');
    }

    if (command === '!painelausencia' || command === '!postarpainelausencia') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem postar o painel de ausência.');
        }

        const embedAusencia = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR_AUSENCIA)
            .setTitle('📋 PAINEL DE REGISTRO DE AUSÊNCIA • CLÃ HUNTERS')
            .setDescription(`
# **MODELO DE AUSÊNCIA • CLÃ HUNTERS**

Caso você vá ficar ausente por **mais de 2 dias**, é obrigatório preencher o formulário para evitar a **remoção do painel por 3 dias de inatividade**.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **REGRAS DE INATIVIDADE:**
• 🚨 Ficar **3 dias sem entrar** sem avisar resultará em **expulsão e remoção do painel**.
• 📢 Notifique a liderança antes de ficar ausente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👇 *Clique no botão abaixo para registrar sua ausência:*
`)
            .setFooter({ text: CONFIG.FOOTER })
            .setTimestamp();

        const rowAusencia = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_iniciar_ausencia')
                .setLabel('Registrar Ausência')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝')
        );

        await message.channel.send({ embeds: [embedAusencia], components: [rowAusencia] });
        return message.reply('✅ Painel de Ausência postado!');
    }
});

// Interações (Botões, Menus e Modais)
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isButton()) {

            // 1. CONFIRMAÇÃO DE LEITURA DAS REGRAS
            if (interaction.customId === 'btn_confirmar_regras') {
                confirmacoesRegras.set(interaction.user.id, { confirmadoAt: new Date() });

                return interaction.reply({
                    content: '✅ **Confirmação registrada!** Você confirmou que leu e aceita todas as regras do Clã Hunters (incluindo a inatividade máxima de 3 dias).\n\n🎯 Agora clique no botão **"Solicitar Set / Registro"** para preencher o formulário.',
                    ephemeral: true
                });
            }

            // 2. INICIAR REGISTRO DE SET (EXIGE LEITURA DAS REGRAS)
            if (interaction.customId === 'btn_iniciar_registro') {
                const confirmacao = confirmacoesRegras.get(interaction.user.id);

                if (!confirmacao) {
                    return interaction.reply({
                        content: '⚠️ **ATENÇÃO:** É **obrigatório** ler e aceitar as regras antes de solicitar seu Set!\n\n👉 Por favor, clique no botão **"📜 Confirmar Leitura das Regras"** primeiro, e depois tente novamente.',
                        ephemeral: true
                    });
                }

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_grupo_registro')
                    .setPlaceholder('🎯 Escolha o seu Grupo / Facção...')
                    .addOptions(
                        CONFIG.GRUPOS.map(g => ({
                            label: g.name,
                            value: g.roleId,
                            description: g.description,
                            emoji: g.emoji
                        }))
                    );

                const row = new ActionRowBuilder().addComponents(selectMenu);

                return interaction.reply({
                    content: '📜 *Regras confirmadas!* Escolha abaixo qual grupo deseja solicitar o Set:',
                    components: [row],
                    ephemeral: true
                });
            }

            // 3. APROVAÇÃO OU RECUSA DO SET PELA STAFF
            if (interaction.customId.startsWith('btn_aprovar_') || interaction.customId.startsWith('btn_recusar_')) {
                const isApprove = interaction.customId.startsWith('btn_aprovar_');
                
                const hasAdmin = CONFIG.CARGOS_ADMINS_APROVADORES.some(r => interaction.member.roles.cache.has(r)) ||
                                 interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

                if (!hasAdmin) {
                    return interaction.reply({ content: '❌ Permissão negada!', ephemeral: true });
                }

                const embed = interaction.message.embeds[0];
                const userDiscordField = embed.fields?.find(f => f.name.includes('Usuário Discord'));
                let userId = userDiscordField ? userDiscordField.value.match(/<@!?(\d+)>/)?.[1] : null;

                if (!userId) userId = interaction.customId.replace('btn_aprovar_', '').replace('btn_recusar_', '');

                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (!member) return interaction.reply({ content: '❌ Membro não encontrado.', ephemeral: true });

                const nomeField = embed.fields?.find(f => f.name.includes('Nome no Jogo'))?.value?.replace(/\*\*/g, '') || 'N/A';
                const idField = embed.fields?.find(f => f.name.includes('ID no Jogo'))?.value?.replace(/\*\*/g, '') || 'N/A';
                const grupoField = embed.fields?.find(f => f.name.includes('Grupo Solicitado'))?.value || '';

                const matchedGroup = CONFIG.GRUPOS.find(g => grupoField.includes(g.name)) || CONFIG.GRUPOS[0];

                if (isApprove) {
                    const nickFinal = formatarApelidoSeguro(matchedGroup.tag, nomeField, idField);

                    try { await member.setNickname(nickFinal); } catch (e) {}
                    try { await member.roles.add(matchedGroup.roleId); } catch (e) {}

                    const approvedEmbed = EmbedBuilder.from(embed)
                        .setColor('#2ECC71')
                        .setTitle('✅ SET & REGISTRO APROVADO')
                        .setDescription('O jogador teve o Set aprovado e as regras devidamente verificadas.')
                        .addFields({ name: '👮 Aprovado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [approvedEmbed], components: [] });
                    await member.send(`🎉 **Parabéns!** Seu Set para **${matchedGroup.name}** foi APROVADO! Apelido alterado para \`${nickFinal}\`.`).catch(() => {});

                    return interaction.reply({ content: `✅ Set de <@${userId}> APROVADO!`, ephemeral: true });
                } else {
                    const rejectedEmbed = EmbedBuilder.from(embed)
                        .setColor('#E74C3C')
                        .setTitle('❌ SET RECUSADO')
                        .addFields({ name: '👮 Recusado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [rejectedEmbed], components: [] });
                    return interaction.reply({ content: `❌ Set de <@${userId}> recusado.`, ephemeral: true });
                }
            }

            // 4. REGISTRAR AUSÊNCIA
            if (interaction.customId === 'btn_iniciar_ausencia') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_ausencia')
                    .setTitle('Formulário de Ausência • Hunters');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('input_ausencia_nome_id')
                            .setLabel('Nome e ID no Jogo')
                            .setPlaceholder('Ex: Bruno Hunter | ID: 1234')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('input_ausencia_datas')
                            .setLabel('Período de Ausência (Início e Retorno)')
                            .setPlaceholder('Ex: 30/07 a 05/08')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('input_ausencia_motivo')
                            .setLabel('Motivo da Ausência')
                            .setPlaceholder('Descreva o motivo...')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }
        }

        // SELEÇÃO DE GRUPO
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_grupo_registro') {
            const roleId = interaction.values[0];
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const modal = new ModalBuilder()
                .setCustomId(`modal_registro_${grupoObj.roleId}`)
                .setTitle(`Set — ${grupoObj.name.substring(0, 25)}`);

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('input_nome_jogo')
                        .setLabel('Nome / Apelido no Jogo')
                        .setPlaceholder('Ex: Bruno Hunters')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('input_id_jogo')
                        .setLabel('Seu ID Numérico')
                        .setPlaceholder('Ex: 4502')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('input_contratante')
                        .setLabel('Quem te recrutou / convidou?')
                        .setPlaceholder('Ex: Bruno Liderança')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
            );

            return interaction.showModal(modal);
        }

        // SUBMIT DO PEDIDO DE SET (APRESENTA A VERIFICAÇÃO DAS REGRAS NA STAFF)
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_registro_')) {
            const roleId = interaction.customId.replace('modal_registro_', '');
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const nomeJogo = interaction.fields.getTextInputValue('input_nome_jogo').trim();
            const idJogo = interaction.fields.getTextInputValue('input_id_jogo').trim();
            const contratante = interaction.fields.getTextInputValue('input_contratante').trim();

            const nickFinal = formatarApelidoSeguro(grupoObj.tag, nomeJogo, idJogo);
            const confirmData = confirmacoesRegras.get(interaction.user.id);

            const dataConfirmacaoStr = confirmData 
                ? `✅ **SIM** (Confirmado pelo jogador)`
                : `❌ **NÃO CONFIRMOU**`;

            const embedAprovacao = new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle('⏳ NOVO PEDIDO DE SET - AGUARDANDO STAFF')
                .addFields(
                    { name: '👤 Usuário Discord', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                    { name: '🎯 Grupo Solicitado', value: `**${grupoObj.name}**`, inline: true },
                    { name: '📜 Regras Lidas & Aceitas?', value: dataConfirmacaoStr, inline: false },
                    { name: '📝 Nome no Jogo', value: `**${nomeJogo}**`, inline: true },
                    { name: '🔢 ID no Jogo', value: `**${idJogo}**`, inline: true },
                    { name: '🤝 Recrutado Por', value: `**${contratante}**`, inline: false },
                    { name: '🏷️ Apelido a ser Gerado', value: `\`${nickFinal}\``, inline: false }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`btn_aprovar_${interaction.user.id}`)
                    .setLabel('Aprovar Cidadania & Set')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(`btn_recusar_${interaction.user.id}`)
                    .setLabel('Recusar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

            const canalAprov = interaction.guild.channels.cache.get(CONFIG.CANAL_APROVACAO_ID);
            if (canalAprov) {
                await canalAprov.send({ embeds: [embedAprovacao], components: [row] });
            }

            return interaction.reply({
                content: `✅ **Pedido de Set Enviado!**\nSua solicitação para **${grupoObj.name}** foi enviada para a Staff.\n📜 *Confirmação de leitura das regras incluída no pedido!*`,
                ephemeral: true
            });
        }

        // SUBMIT DA AUSÊNCIA
        if (interaction.isModalSubmit() && interaction.customId === 'modal_ausencia') {
            const nomeId = interaction.fields.getTextInputValue('input_ausencia_nome_id');
            const datas = interaction.fields.getTextInputValue('input_ausencia_datas');
            const motivo = interaction.fields.getTextInputValue('input_ausencia_motivo');

            const embedLog = new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle('📋 REGISTRO DE AUSÊNCIA • CLÃ HUNTERS')
                .addFields(
                    { name: '👤 Jogador', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '🆔 Nome & ID', value: `**${nomeId}**`, inline: true },
                    { name: '📅 Período', value: `**${datas}**`, inline: false },
                    { name: '📝 Motivo', value: motivo, inline: false },
                    { name: '🛡️ Proteção de Inatividade', value: '✅ **Protegido contra remoção de 3 dias**', inline: false }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            const canalLog = interaction.guild.channels.cache.get(CONFIG.CANAL_AUSENCIA_LOGS_ID);
            if (canalLog) {
                await canalLog.send({ embeds: [embedLog] });
            }

            return interaction.reply({
                content: '✅ **Ausência registrada com sucesso!** Você está protegido contra a regra de remoção de 3 dias.',
                ephemeral: true
            });
        }

    } catch (err) {
        console.error('Erro na interação:', err);
    }
});

client.login(TOKEN);
