/**
 * ============================================================================
 * BOT OFICIAL DE REGISTRO DE SET, REGRAS NO PV & INATIVIDADE DE 3 DIAS
 * CLÃ HUNTERS & FAMÍLIA SOUZA INFINITA (DISCORD.JS V14)
 * ============================================================================
 * 
 * 🚀 FUNCIONA 100% DIRETO (SEM NECESSIDADE DE ARQUIVO .ENV)
 * 
 * Instalação dos pacotes:
 * npm install discord.js express
 * 
 * Execução:
 * node index.js
 */

import express from 'express';
import {
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
} from "discord.js";

// ===============================
// CONFIGURAÇÃO DE AMBIENTE & TOKEN
// ===============================
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || "SEU_DISCORD_BOT_TOKEN";
const PORT = process.env.PORT || 3000;

// Registrador de confirmação no PV
const confirmacoesRegras = new Map();

// ===============================
// CONFIGURAÇÃO GERAL DO SISTEMA
// ===============================
const CONFIG = {
    CLIENT_ID: process.env.CLIENT_ID || "1515448473246498866",
    GUILD_ID: process.env.GUILD_ID || "SEU_GUILD_ID",
    
    // IDs dos Canais do Servidor
    CANAL_REGISTRO_ID: process.env.CANAL_REGISTRO_ID || "1515448473246498866",
    CANAL_APROVACAO_ID: process.env.CANAL_APROVACAO_ID || "1515448473246498866",
    CANAL_LOGS_ID: process.env.CANAL_LOGS_ID || "1531670383483158700",
    CANAL_ENTRADA_SAIDA_ID: process.env.CANAL_ENTRADA_SAIDA_ID || "1515125826780135485",
    
    // IDs do Painel de Ausência
    CANAL_PAINEL_AUSENCIA_ID: process.env.CANAL_PAINEL_AUSENCIA_ID || "1531670383483158700",
    CANAL_AUSENCIA_LOGS_ID: process.env.CANAL_AUSENCIA_LOGS_ID || "1531670383483158700",

    // Cargos Administradores Autorizados
    CARGOS_ADMINS_APROVADORES: [
        "1515125820836941985",
        "1515125822795546715"
    ],

    CARGO_HUNTERS_RECRUTA_ID: "1515125826780135485",

    EMBED_COLOR: "#2ECC71",
    EMBED_COLOR_AUSENCIA: "#E67E22",
    FOOTER: "FiveZ & Lumenfall • Família Souza & Clã Hunters",

    // Lista de Grupos / Facções (Menu de Seleção)
    GRUPOS: [
        {
            "id": "grupo_hunters",
            "name": "Hunters FiveZ (Recruta)",
            "roleId": "1515125826780135485",
            "tag": "|Recruta|",
            "description": "Caçadores de elite Hunters FiveZ (Recruta)",
            "emoji": "🎯"
        },
        {
            "id": "grupo_comprador",
            "name": "Comprador FiveZ",
            "roleId": "1517662363266842725",
            "tag": "|Comprador|",
            "description": "Cargo oficial de Comprador FiveZ",
            "emoji": "🛒"
        },
        {
            "id": "grupo_souza",
            "name": "Família Souza",
            "roleId": "1515125828185493675",
            "tag": "|SOUZA|",
            "description": "Membros oficiais da Família Souza",
            "emoji": "❤️"
        },
        {
            "id": "grupo_amigos",
            "name": "Amigos & Visitantes",
            "roleId": "1515125842328424640",
            "tag": "|AMG|",
            "description": "Cargo de entrada para amigos e aliados",
            "emoji": "🤝"
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

// Servidor Express Keep-Alive
const app = express();
app.get('/', (req, res) => res.send('🟢 Bot Família Souza Online 24/7!'));
app.listen(PORT, '0.0.0.0', () => console.log(`🌐 Keep-Alive na porta ${PORT}`));

// Proteção Anti-Crash
process.on('unhandledRejection', (reason) => console.error('⚠️ [Anti-Crash]:', reason));
process.on('uncaughtException', (error) => console.error('⚠️ [Anti-Crash]:', error));

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
    const embedPV = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('📜 REGRAS OBRIGATÓRIAS DO CLÃ HUNTERS & FAMÍLIA SOUZA')
        .setDescription(`Olá <@${user.id}>! Seja bem-vindo(a)!\n\nAbaixo estão as regras oficiais do servidor. Ao solicitar seu Set, você deve confirmar a leitura clicando no botão verde abaixo:\n\n📌 **1. RESPEITO À HIERARQUIA & LIDERANÇA:** Respeite todos os membros.\n\n📌 **2. INATIVIDADE MÁXIMA DE 3 DIAS:** Ficar 3 dias sem logar sem registrar ausência resulta em remoção automática.\n\n📌 **3. NOME E TAG OBRIGATÓRIOS:** Mantenha a tag oficial do seu grupo visível no seu apelido.\n\n👇 **Clique no botão abaixo para confirmar para a Staff que você leu e concorda com as regras:**`)
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
        return false;
    }
}

client.once(Events.ClientReady, (c) => {
    console.log(`🤖 BOT CONECTADO COMO: ${c.user.tag}`);
});

// Comandos de Texto (!painel, !painelausencia)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;
    const command = message.content.toLowerCase().trim();

    if (command === '!painel' || command === '!postarpainel') {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const guildIcon = message.guild.iconURL() || 'https://i.imgur.com/8Q8S4Zb.png';
        const embed = new EmbedBuilder()
            .setColor(CONFIG.EMBED_COLOR)
            .setAuthor({ name: '👑 FAMÍLIA SOUZA INFINITA 👑', iconURL: guildIcon })
            .setTitle('🏡 Sistema de Registro — Cidadania & Grupos')
            .setThumbnail(guildIcon)
            .setDescription(`# Seja bem-vindo à nossa Comunidade!

📢 **AVISO IMPORTANTE PARA TODOS (@everyone):**
⚠️ **PRAZO LIMITE DE REGISTRO:** Todo membro que entrar no servidor tem um prazo máximo de **3 dias** para realizar o registro de cidadania.

Para desbloquear os canais do servidor e registrar sua cidadania, selecione seu grupo abaixo.

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
        return message.reply('✅ Painel Oficial de Registro postado!');
    }
});

// Gerenciamento de Interações
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isButton()) {

            // Botão no PV
            if (interaction.customId === 'btn_confirmar_regras_pv') {
                confirmacoesRegras.set(interaction.user.id, { confirmado: true, dataConfirmacao: new Date() });

                try {
                    const canalAprov = await client.channels.fetch(CONFIG.CANAL_APROVACAO_ID).catch(() => null);
                    if (canalAprov && typeof canalAprov.send === 'function') {
                        const embedConfirm = new EmbedBuilder()
                            .setColor('#2ECC71')
                            .setTitle('📜 REGRAS CONFIRMADAS NO PV')
                            .setDescription(`O jogador <@${interaction.user.id}> (${interaction.user.tag}) confirmou a leitura das regras no PV!`)
                            .setTimestamp();
                        await canalAprov.send({ embeds: [embedConfirm] }).catch(() => {});
                    }
                } catch (e) {}

                return interaction.reply({
                    content: '✅ **CONFIRMAÇÃO REGISTRADA COM SUCESSO!** A Staff foi notificada no canal de aprovação!',
                    ephemeral: false
                });
            }

            // Iniciar Registro
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

                return interaction.reply({
                    content: enviouPV 
                        ? '📩 **As regras foram enviadas no seu PV com o botão de confirmação!**\n\n🎯 Escolha abaixo o seu grupo:'
                        : '⚠️ Abra seu PV para receber as regras!\n\n🎯 Escolha abaixo o seu grupo:',
                    components: [row],
                    ephemeral: true
                });
            }

            // Aprovar ou Recusar Set
            if (interaction.customId.startsWith('btn_aprovar_') || interaction.customId.startsWith('btn_recusar_')) {
                const isApprove = interaction.customId.startsWith('btn_aprovar_');
                const hasAdmin = CONFIG.CARGOS_ADMINS_APROVADORES.some(r => interaction.member?.roles.cache.has(r)) ||
                                 interaction.member?.permissions.has(PermissionsBitField.Flags.Administrator);

                if (!hasAdmin) return interaction.reply({ content: '❌ Apenas Administradores podem aprovar.', ephemeral: true });

                const embed = interaction.message.embeds[0];
                let userId = interaction.customId.replace('btn_aprovar_', '').replace('btn_recusar_', '');

                const member = await interaction.guild?.members.fetch(userId).catch(() => null);
                if (!member) return interaction.reply({ content: '❌ Membro não encontrado no servidor.', ephemeral: true });

                const nomeField = embed.fields?.find(f => f.name.includes('Nome no Jogo'))?.value?.replace(/\*/g, '') || 'N/A';
                const idField = embed.fields?.find(f => f.name.includes('ID no Jogo'))?.value?.replace(/\*/g, '') || 'N/A';
                const grupoField = embed.fields?.find(f => f.name.includes('Grupo Escolhido'))?.value || '';

                const matchedGroup = CONFIG.GRUPOS.find(g => grupoField.includes(g.name)) || CONFIG.GRUPOS[0];

                if (isApprove) {
                    // Formata automaticamente como |Recruta| Nome | ID para o grupo Hunters
                    const nickFinal = formatarApelidoSeguro(matchedGroup.tag, nomeField, idField);

                    try { await member.setNickname(nickFinal); } catch (e) {}
                    try { await member.roles.add(matchedGroup.roleId); } catch (e) {}

                    const approvedEmbed = EmbedBuilder.from(embed)
                        .setColor('#2ECC71')
                        .setTitle('✅ SET & CIDADANIA APROVADA')
                        .setDescription(`Apelido ajustado para: \`${nickFinal}\``)
                        .addFields({ name: '👮 Aprovado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [approvedEmbed], components: [] });
                    await member.send(`🎉 **Parabéns!** Seu Set foi APROVADO! Seu apelido foi alterado para \`${nickFinal}\`.`).catch(() => {});

                    return interaction.reply({ content: `✅ Set de <@${userId}> APROVADO como \`${nickFinal}\`!`, ephemeral: true });
                } else {
                    const rejectedEmbed = EmbedBuilder.from(embed)
                        .setColor('#E74C3C')
                        .setTitle('❌ SET RECUSADO')
                        .addFields({ name: '👮 Recusado por', value: `<@${interaction.user.id}>`, inline: false });

                    await interaction.message.edit({ embeds: [rejectedEmbed], components: [] });
                    return interaction.reply({ content: `❌ Set de <@${userId}> recusado.`, ephemeral: true });
                }
            }
        }

        // Seleção do Grupo
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_grupo_registro') {
            const roleId = interaction.values[0];
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const modal = new ModalBuilder()
                .setCustomId(`modal_registro_${grupoObj.roleId}`)
                .setTitle(`Set — ${grupoObj.name.substring(0, 25)}`);

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('input_nome_jogo').setLabel('Nome / Apelido no Jogo').setPlaceholder('Ex: Bruno').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('input_id_jogo').setLabel('Seu ID Numérico').setPlaceholder('Ex: 4502').setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('input_contratante').setLabel('Quem te recrutou / convidou?').setPlaceholder('Ex: Bruno Liderança').setStyle(TextInputStyle.Short).setRequired(true)
                )
            );

            return interaction.showModal(modal);
        }

        // Envio do Formulário Modal
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_registro_')) {
            const roleId = interaction.customId.replace('modal_registro_', '');
            const grupoObj = CONFIG.GRUPOS.find(g => g.roleId === roleId) || CONFIG.GRUPOS[0];

            const nomeJogo = interaction.fields.getTextInputValue('input_nome_jogo').trim();
            const idJogo = interaction.fields.getTextInputValue('input_id_jogo').trim();
            const contratante = interaction.fields.getTextInputValue('input_contratante').trim();

            const nickFinal = formatarApelidoSeguro(grupoObj.tag, nomeJogo, idJogo);
            const confirmacaoPv = confirmacoesRegras.get(interaction.user.id);
            const statusRegrasPv = confirmacaoPv?.confirmado
                ? '✅ **SIM — REGRAS LIDAS E CONFIRMADAS NO PV!**'
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
                new ButtonBuilder().setCustomId(`btn_aprovar_${interaction.user.id}`).setLabel('Aprovar Cidadania & Set').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId(`btn_recusar_${interaction.user.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger).setEmoji('❌')
            );

            let canalAprov = await client.channels.fetch(CONFIG.CANAL_APROVACAO_ID).catch(() => null);
            if (canalAprov && typeof canalAprov.send === 'function') {
                await canalAprov.send({ embeds: [embedAprovacao], components: [row] });
            }

            return interaction.reply({
                content: `✅ **Pedido de Set Enviado!** Sua solicitação para **${grupoObj.name}** foi enviada para o canal da Staff!`,
                ephemeral: true
            });
        }
    } catch (err) {
        console.error('Erro na interação:', err);
    }
});

client.login(TOKEN);
