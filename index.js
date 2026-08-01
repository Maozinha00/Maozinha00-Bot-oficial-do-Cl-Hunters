/**
 * ============================================================================
 * BOT OFICIAL DE REGISTRO DE SET, REGRAS NO PV, LOGS DE APROVADOS & INATIVIDADE
 * CLÃ HUNTERS & FAMÍLIA SOUZA INFINITA (DISCORD.JS V14 - COMMONJS)
 * ============================================================================
 * 
 * 🚀 FUNCIONA 100% DIRETO COM: node index.js
 * 
 * Instalação prévia das dependências:
 * npm install discord.js express
 */

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
} = require('discord.js');

// ===============================
// CONFIGURAÇÃO DE AMBIENTE & TOKEN
// ===============================
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || "SEU_DISCORD_BOT_TOKEN";
const PORT = process.env.PORT || 3000;

if (!TOKEN || TOKEN.includes("SEU_DISCORD_BOT_TOKEN")) {
    console.warn("⚠️ AVISO: Substitua 'SEU_DISCORD_BOT_TOKEN' pelo Token real do seu bot!");
}

// Map em memória para registrar a confirmação das regras no PV
const confirmacoesRegras = new Map();

// ===============================
// CONFIGURAÇÃO GERAL DOS IDS DO SERVIDOR
// ===============================
const CONFIG = {
    CLIENT_ID: process.env.CLIENT_ID || "SEU_CLIENT_ID",
    GUILD_ID: process.env.GUILD_ID || "SEU_GUILD_ID",
    
    // IDs dos Canais
    CANAL_REGISTRO_ID: process.env.CANAL_REGISTRO_ID || "1515125852264603700",
    CANAL_APROVACAO_ID: process.env.CANAL_APROVACAO_ID || "1515448473246498866",
    CANAL_LOGS_ID: process.env.CANAL_LOGS_ID || "1515448473246498866", // Canal de Logs de Sets Aprovados
    CANAL_ENTRADA_SAIDA_ID: process.env.CANAL_ENTRADA_SAIDA_ID || "1515125850419220500",
    
    // IDs do Painel de Ausência
    CANAL_PAINEL_AUSENCIA_ID: process.env.CANAL_PAINEL_AUSENCIA_ID || "1531670381016772700",
    CANAL_AUSENCIA_LOGS_ID: process.env.CANAL_AUSENCIA_LOGS_ID || "1531670383483158700",

    // Cargos Administradores Autorizados a Aprovar
    CARGOS_ADMINS_APROVADORES: [
        process.env.CARGO_ADMIN_1 || "1515125820836941985",
        process.env.CARGO_ADMIN_2 || "1515125822795546715"
    ].filter(Boolean),

    EMBED_COLOR: "#2ECC71",
    EMBED_COLOR_AUSENCIA: "#E67E22",
    FOOTER: "FiveZ & Lumenfall • Sistema Automático Anti-Queda • Família Souza",

    // Lista de Grupos / Cargos / Tags
    GRUPOS: [
        {
            id: "grupo_hunters",
            name: "Hunters FiveZ (Recruta)",
            roleId: process.env.CARGO_HUNTERS_RECRUTA || "1515125826780135485",
            tag: "|Recruta|",
            description: "Set padrão para recrutas do Clã Hunters",
            emoji: "🎯"
        },
        {
            id: "grupo_comprador",
            name: "Comprador FiveZ",
            roleId: process.env.CARGO_COMPRADOR_FIVEZ || "1517662363266842725",
            tag: "|Comprador|",
            description: "Compradores oficiais FiveZ",
            emoji: "🛒"
        },
        {
            id: "grupo_souza",
            name: "Família Souza",
            roleId: process.env.CARGO_FAMILIA_SOUZA || "1515125828185493675",
            tag: "|Família Souza|",
            description: "Membros oficiais da Família Souza",
            emoji: "👑"
        },
        {
            id: "grupo_amigos",
            name: "Amigos & Visitantes",
            roleId: process.env.CARGO_AMIGOS || "1515125842328424640",
            tag: "|Amigos|",
            description: "Visitantes e aliados do servidor",
            emoji: "🤝"
        }
    ]
};

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

// ===============================
// SERVIDOR EXPRESS KEEP-ALIVE (24/7)
// ===============================
const app = express();

app.get('/', (req, res) => {
    res.send('🟢 Bot Família Souza & Clã Hunters Online 24/7!');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        botConnected: Boolean(client.user),
        botUser: client.user ? client.user.tag : null,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor HTTP Keep-Alive rodando na porta ${PORT}`);
});

// Proteção Anti-Crash Global
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ [Anti-Crash] Rejeição não tratada:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('⚠️ [Anti-Crash] Exceção não capturada:', error);
});

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
function formatarApelidoSeguro(tag, nome, id) {
    let nick = `${tag} ${nome} | ${id}`.trim();
    if (nick.length > 32) {
        const tamanhoExtra = tag.length + id.length + 4;
        const maxNome = Math.max(1, 32 - tamanhoExtra);
        nick = `${tag} ${nome.substring(0, maxNome)} | ${id}`.trim();
    }
    return nick.substring(0, 32);
}

async function enviarRegrasPVComConfirmacao(user) {
    const regrasTexto = `📌 **1. RESPEITO À HIERARQUIA & LIDERANÇA:**\nRespeite todos os membros e as decisões da administração e liderança.\n\n📌 **2. INATIVIDADE MÁXIMA DE 3 DIAS:**\nFicar 3 dias sem logar no servidor sem registrar no painel de ausência resultará em desvinculação automática e remoção do Set.\n\n📌 **3. NOME E TAG OBRIGATÓRIOS:**\nMantenha a tag oficial do seu grupo visível no seu apelido no Discord e no jogo.\n\n📌 **4. PROIBIDO APOSTAS E COMPORTAMENTO TÓXICO:**\nEvite brigas, discussões ou ofensas nos canais de texto ou voz do servidor.`;

    const embedPV = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('📜 REGRAS OBRIGATÓRIAS DO CLÃ HUNTERS & FAMÍLIA SOUZA')
        .setDescription(`Olá <@${user.id}>! Seja bem-vindo(a)!\n\nAbaixo estão as regras oficiais do servidor. Ao solicitar seu Set, você deve confirmar a leitura clicando no botão verde abaixo:\n\n${regrasTexto}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🚨 **REGRA IMPORTANTE DE INATIVIDADE (3 DIAS):**\nFicar **3 dias sem entrar** no servidor sem registrar a ausência prévia no painel resultará na **remoção automática do clã e perda do Set**!\n\n👇 **Clique no botão abaixo para confirmar para a Staff que você leu e concorda com as regras:**`)
        .setFooter({ text: CONFIG.FOOTER })
        .setTimestamp();

    const rowPV = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_confirmar_regras_pv')
            .setLabel('Li e Aceito as Regras do Clã')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅')
    );

    try {
        await user.send({ embeds: [embedPV], components: [rowPV] });
        return true;
    } catch (dmErr) {
        console.log(`PV fechado para ${user.tag}`);
        return false;
    }
}

// ===============================
// EVENTOS DO BOT
// ===============================
client.once(Events.ClientReady, (c) => {
    console.log(`🤖 BOT FAMÍLIA SOUZA & HUNTERS CONECTADO COMO: ${c.user.tag}`);
});

client.on(Events.GuildMemberAdd, async (member) => {
    try {
        console.log(`👤 Novo membro entrou: ${member.user.tag}`);
        await enviarRegrasPVComConfirmacao(member.user);

        if (CONFIG.CANAL_ENTRADA_SAIDA_ID) {
            const channel = member.guild.channels.cache.get(CONFIG.CANAL_ENTRADA_SAIDA_ID);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor(CONFIG.EMBED_COLOR)
                    .setTitle('🚪 BEM-VINDO À FAMÍLIA SOUZA & CLÃ HUNTERS!')
                    .setDescription(`Seja bem-vindo(a) <@${member.id}>!\n\n> 📝 Dirija-se ao canal <#${CONFIG.CANAL_REGISTRO_ID}>\n> 📩 As regras oficiais foram enviadas no seu **PV (Privado)** com botão de confirmação!\n> 🎯 Clique no botão **Realizar Registro** para pedir seu Set.`)
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

// Comandos de Texto para Administradores (!painel, !painelausencia, !setup_registro)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    const command = message.content.toLowerCase().trim();

    if (command === '!painel' || command === '!postarpainel' || command === '!setup_registro' || command === '!setuppainel') {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem executar este comando.');
        }

        const guildIcon = message.guild.iconURL() || 'https://i.imgur.com/8Q8S4Zb.png';

        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setAuthor({ name: '👑 FAMÍLIA SOUZA INFINITA 👑', iconURL: guildIcon })
            .setTitle('🏡 Sistema de Registro — Cidadania & Grupos')
            .setThumbnail(guildIcon)
            .setDescription(`# Seja bem-vindo à nossa Comunidade!

📢 **AVISO IMPORTANTE PARA TODOS (@everyone):**
⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro que entrar no servidor tem um prazo máximo de **3 dias** para realizar o registro de cidadania.
🚫 Se você passar de **3 dias** no servidor sem realizar o seu registro, você será **kickado automaticamente** pelo sistema!

Para desbloquear todos os canais do servidor e registrar sua cidadania, selecione seu grupo abaixo.

🎁 **Benefícios ao registrar:**
✅ **Cargo do seu Grupo escolhido**
🏷️ **Apelido Atualizado:** Com a tag do grupo, seu Nome e ID
🔓 **Liberação imediata** dos canais do servidor

👇 *Clique no botão abaixo, escolha seu grupo e preencha o formulário!*`)
            .setFooter({ text: CONFIG.FOOTER })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_iniciar_registro')
                .setLabel('Realizar Registro')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🏡')
        );

        await message.channel.send({ content: '@everyone', embeds: [embed], components: [row] });
        return message.reply('✅ Painel Oficial de Registro postado com sucesso!');
    }

    if (command === '!painelausencia' || command === '!painel_ausencia' || command === '!postarausencia') {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Apenas administradores podem executar este comando.');
        }

        const embedAusencia = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR_AUSENCIA)
            .setTitle('📋 PAINEL DE REGISTRO DE AUSÊNCIA • HUNTERS & SOUZA')
            .setDescription(`
# **MODELO DE AUSÊNCIA • HUNTERS & SOUZA**

Caso vá ficar ausente por **mais de 2 dias**, é obrigatório preencher o formulário para evitar a **remoção por inatividade de 3 dias**.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **REGRAS IMPORTANTES DE INATIVIDADE:**
• 🚨 Ficar **3 dias sem entrar** no servidor sem registrar a ausência resultará na **remoção do painel e do clã**!
• 📢 A ausência deve ser informada **antes** de ficar inativo.

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
        return message.reply('✅ Painel de Ausência postado com sucesso!');
    }
});

// INTERAÇÕES (BOTÕES / MODAIS / MENUS)
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isButton()) {

            if (interaction.customId === 'btn_confirmar_regras_pv') {
                confirmacoesRegras.set(interaction.user.id, {
                    confirmado: true,
                    dataConfirmacao: new Date()
                });

                try {
                    let canalAprov = null;
                    if (CONFIG.CANAL_APROVACAO_ID) {
                        canalAprov = await client.channels.fetch(CONFIG.CANAL_APROVACAO_ID).catch(() => null);
                    }
                    if (canalAprov && typeof canalAprov.send === 'function') {
                        const embedConfirm = new EmbedBuilder()
                            .setColor('#2ECC71')
                            .setTitle('📜 REGRAS CONFIRMADAS NO PV')
                            .setDescription(`O jogador <@${interaction.user.id}> (${interaction.user.tag}) clicou no botão verde no PV e **confirmou que leu e concorda com todas as regras do clã**!`)
                            .setTimestamp();

                        await canalAprov.send({ embeds: [embedConfirm] }).catch(() => {});
                    }
                } catch (e) {}

                return interaction.reply({
                    content: '✅ **CONFIRMAÇÃO REGISTRADA COM SUCESSO!**\nObrigado por ler e aceitar as regras oficiais. A Staff foi notificada!',
                    ephemeral: false
                });
            }

            if (interaction.customId === 'btn_iniciar_registro') {
                const enviouPV = await enviarRegrasPVComConfirmacao(interaction.user);

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

                const msgResponse = enviouPV
                    ? '📩 **As regras foram enviadas no seu PV (Privado) com o botão de confirmação!**\n\n🎯 Escolha abaixo para qual grupo deseja solicitar o Set:'
                    : '⚠️ *Nota: Seu PV parece estar fechado nas configurações do Discord. Abra o PV para receber e confirmar as regras!*\n\n🎯 Escolha abaixo para qual grupo deseja solicitar o Set:';

                return interaction.reply({
                    content: msgResponse,
                    components: [row],
                    ephemeral: true
                });
            }

            if (interaction.customId.startsWith('btn_aprovar_') || interaction.customId.startsWith('btn_recusar_')) {
                const isApprove = interaction.customId.startsWith('btn_aprovar_');
                
                const hasAdmin = CONFIG.CARGOS_ADMINS_APROVADORES.some(r => interaction.member?.roles.cache.has(r)) ||
                                 interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator);

                if (!hasAdmin) {
                    return interaction.reply({ content: '❌ Permissão negada! Apenas Administradores podem aprovar Sets.', ephemeral: true });
                }

                const embed = interaction.message.embeds[0];
                if (!embed) return interaction.reply({ content: '❌ Embed não encontrada.', ephemeral: true });

                const userDiscordField = embed.fields?.find(f => f.name.includes('Usuário Discord'));
                let userId = userDiscordField ? userDiscordField.value.match(/<@!?(\d+)>/)?.[1] : null;

                if (!userId) userId = interaction.customId.replace('btn_aprovar_', '').replace('btn_recusar_', '');

                const member = await interaction.guild?.members.fetch(userId).catch(() => null);
                if (!member) return interaction.reply({ content: '❌ Membro não encontrado no servidor.', ephemeral: true });

                const nomeField = embed.fields?.find(f => f.name.includes('Nome no Jogo'))?.value?.replace(/\*/g, '') || 'N/A';
                const idField = embed.fields?.find(f => f.name.includes('ID no Jogo'))?.value?.replace(/\*/g, '') || 'N/A';
                const grupoField = embed.fields?.find(f => f.name.includes('Grupo Escolhido'))?.value || '';

                const matchedGroup = CONFIG.GRUPOS.find(g => grupoField.includes(g.name)) || CONFIG.GRUPOS[0];

                if (isApprove) {
                    const nickFinal = formatarApelidoSeguro(matchedGroup.tag, nomeField, idField);

                    try { await member.setNickname(nickFinal); } catch (e) {}
                    try { await member.roles.add(matchedGroup.roleId); } catch (e) {}

                    const approvedEmbed = EmbedBuilder.from(embed)
                        .setColor('#2ECC71')
                        .setTitle('✅ SET & CIDADANIA APROVADA')
                        .setDescription(`O jogador teve o Set aprovado e o apelido ajustado no servidor.`)
                        .addFields({ name: '👮 Aprovado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [approvedEmbed], components: [] });
                    await member.send(`🎉 **Parabéns!** Seu Set para **${matchedGroup.name}** foi APROVADO! Seu apelido foi ajustado para \`${nickFinal}\`.`).catch(() => {});

                    try {
                        let canalLogs = null;
                        if (CONFIG.CANAL_LOGS_ID) {
                            canalLogs = await client.channels.fetch(CONFIG.CANAL_LOGS_ID).catch(() => null);
                        }
                        if (canalLogs && typeof canalLogs.send === 'function') {
                            const embedLogAprovado = new EmbedBuilder()
                                .setColor('#2ECC71')
                                .setTitle('📜 LOG DE REGISTRO & SET APROVADO')
                                .addFields(
                                    { name: '👤 Jogador', value: `<@${userId}> (${member.user.tag})`, inline: true },
                                    { name: '🎯 Grupo / Facção', value: `**${matchedGroup.name}**`, inline: true },
                                    { name: '🏷️ Apelido Definido', value: `\`${nickFinal}\``, inline: false },
                                    { name: '👮 Aprovado por Staff', value: `<@${interaction.user.id}>`, inline: true },
                                    { name: '📝 ID & Nome no Jogo', value: `ID: **${idField}** | Nome: **${nomeField}**`, inline: true }
                                )
                                .setFooter({ text: CONFIG.FOOTER })
                                .setTimestamp();

                            await canalLogs.send({ embeds: [embedLogAprovado] }).catch(() => {});
                        }
                    } catch (eLog) {
                        console.error('Erro ao enviar log de aprovação:', eLog);
                    }

                    return interaction.reply({ content: `✅ Set de <@${userId}> APROVADO com sucesso! Log registrado.`, ephemeral: true });
                } else {
                    const rejectedEmbed = EmbedBuilder.from(embed)
                        .setColor('#E74C3C')
                        .setTitle('❌ SET RECUSADO')
                        .addFields({ name: '👮 Recusado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [rejectedEmbed], components: [] });
                    await member.send(`❌ Seu pedido de Set para o Clã Hunters foi recusado.`).catch(() => {});

                    return interaction.reply({ content: `❌ Set de <@${userId}> recusado.`, ephemeral: true });
                }
            }

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

        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_registro_')) {
            const roleId = interaction.customId.replace('modal_registro_', '');
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const nomeJogo = interaction.fields.getTextInputValue('input_nome_jogo').trim();
            const idJogo = interaction.fields.getTextInputValue('input_id_jogo').trim();
            const contratante = interaction.fields.getTextInputValue('input_contratante').trim();

            const nickFinal = formatarApelidoSeguro(grupoObj.tag, nomeJogo, idJogo);

            const confirmacaoPv = confirmacoesRegras.get(interaction.user.id);
            const statusRegrasPv = confirmacaoPv?.confirmado
                ? '✅ **SIM — REGRAS LIDAS E CONFIRMADAS PELO JOGADOR NO PV!**'
                : '⏳ **REGRAS ENVIADAS NO PV — AGUARDANDO JOGADOR CLICAR NO BOTÃO DE CONFIRMAÇÃO**';

            const embedAprovacao = new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle('⏳ NOVO PEDIDO DE SET - AGUARDANDO STAFF')
                .addFields(
                    { name: '👤 Usuário Discord', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                    { name: '🎯 Grupo Solicitado', value: `**${grupoObj.name}**`, inline: true },
                    { name: '📜 Confirmou Regras no PV?', value: statusRegrasPv, inline: false },
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

            let canalAprov = null;
            try {
                if (CONFIG.CANAL_APROVACAO_ID) {
                    canalAprov = await client.channels.fetch(CONFIG.CANAL_APROVACAO_ID).catch(() => null);
                }
            } catch (errCh) {}

            let enviouCanal = false;
            if (canalAprov && typeof canalAprov.send === 'function') {
                try {
                    await canalAprov.send({ embeds: [embedAprovacao], components: [row] });
                    enviouCanal = true;
                } catch (errSend) {}
            }

            const avisoEnvio = enviouCanal
                ? '✅ **Pedido de Set Enviado!**\nSua solicitação para **' + grupoObj.name + '** foi enviada para o canal da Staff!\n📩 *Não se esqueça de clicar no botão verde de confirmação nas regras que enviamos no seu PV!*'
                : '⚠️ **Pedido Registrado!**\n*Aviso: Verifique se o ID do canal de aprovação no Bot está correto!*';

            return interaction.reply({
                content: avisoEnvio,
                ephemeral: true
            });
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_ausencia') {
            const nomeId = interaction.fields.getTextInputValue('input_ausencia_nome_id');
            const datas = interaction.fields.getTextInputValue('input_ausencia_datas');
            const motivo = interaction.fields.getTextInputValue('input_ausencia_motivo');

            const embedLog = new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle('📋 REGISTRO DE AUSÊNCIA • HUNTERS & SOUZA')
                .addFields(
                    { name: '👤 Jogador', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '🆔 Nome & ID', value: `**${nomeId}**`, inline: true },
                    { name: '📅 Período', value: `**${datas}**`, inline: false },
                    { name: '📝 Motivo', value: motivo, inline: false },
                    { name: '🛡️ Proteção de Inatividade', value: '✅ **Protegido contra remoção de 3 dias**', inline: false }
                )
                .setFooter({ text: CONFIG.FOOTER })
                .setTimestamp();

            let canalLog = null;
            try {
                if (CONFIG.CANAL_AUSENCIA_LOGS_ID) {
                    canalLog = await client.channels.fetch(CONFIG.CANAL_AUSENCIA_LOGS_ID).catch(() => null);
                }
            } catch (e) {}

            if (canalLog && typeof canalLog.send === 'function') {
                await canalLog.send({ embeds: [embedLog] }).catch(() => {});
            }

            return interaction.reply({
                content: '✅ **Ausência registrada com sucesso!** Você está protegido contra a regra de remoção por 3 dias de inatividade.',
                ephemeral: true
            });
        }

    } catch (err) {
        console.error('Erro na interação:', err);
    }
});

// LOGIN DO BOT
client.login(TOKEN);
